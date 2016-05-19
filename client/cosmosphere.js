Session.setDefault('packageName', "autoupdate");


Template.layout.onRendered(function () {
  this.$('#sample3').val(Session.get('packageName'))
});


Template.layout.helpers({
  packageName: function () {
    return Session.get('packageName');
  }
});

Template.layout.events({
  'submit #package-form': function (event, template) {
    event.preventDefault();
    var val = template.$('#sample3').val();
    // increment the counter when button is clicked
    Session.set('packageName', val);

    graph.create(val);
  }
});

Meteor.startup(function () {
  graph = {
    nodes: [],
    links: [],
    create (val) {
      console.log('Creating graph for package: ', val);
      // Get package data
      Meteor.call('getDependenciesTree', val, (error, deps) => {
        graph.reset();

        if (error) {
          console.log('error: ', error);
        }

        // 1. {dep1: {dep2: {}}}
        // 2. dep1 => nodes [dep1]
        // 3. dep1 <---> dep2
        // 4. dep2 => nodes [dep1, dep2]
        // 5. link1 => links [link1{target: dep1[0], source: dep2[1]}]

        // Create initial node (and cater for 0-index as starting point)
        var initialTarget = graph.nodes.push({name: val}) - 1;

        var construct = function construct (deps, target) {
          _.each(deps, (dep) => {
            // Store dep position
            var source = graph.nodes.push(dep) - 1;

            graph.nodes[source].name = dep.packageName;

            // Set new target
            target = graph.links.push({target, source}) - 1;

            if (dep.dependencies && dep.dependencies[0] && dep.dependencies[0].references) {
              // We must go deeper! Continue constructing if more deps are found
              construct(dep.dependencies, target);
            }
          });
        }

        construct(deps, initialTarget);

        console.log('Nodes: ', graph.nodes)

        graph.force.nodes(graph.nodes).links(graph.links).start();

        graph.svgLinks = graph.svg.selectAll('.link')
          .data(graph.links)
          .enter().append('line')
          .attr('class', 'link');

        graph.svgNodes = graph.svg.selectAll('.node')
          .data(graph.nodes)
          .enter().append('g')
          .attr('class', 'node')
          .call(graph.force.drag);

        graph.svgNodes.append('text')
          .attr('dx', 12)
          .attr('dy', '.35em')
          .text(function (d) {return d.name;});
      });
    },
    reset: function () {
      graph.nodes = [];
      graph.links = [];
    }
  };
  graph.width = 960;
  graph.height = 500;

  graph.fill = d3.scale.category20();

  graph.force = d3.layout.force()
    .size([graph.width, graph.height])
    //.nodes([{}])
    .linkDistance(300)
    .charge(-60)
    .on("start", function () {});

  graph.svg = d3.select("#graph");

  /*graph.nodes = graph.force.nodes();
  graph.links = graph.force.links();
  graph.svgNodes = graph.svg.selectAll(".node");
  graph.svgLinks = graph.svg.selectAll(".link");*/
});
