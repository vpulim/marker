if (Meteor.is_client) {
    Meteor.startup(function () {
        $('#document').editable();
    });
}

if (Meteor.is_server) {
  Meteor.startup(function () {
  });
}
