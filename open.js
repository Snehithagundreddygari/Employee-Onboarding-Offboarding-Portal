(function execute(inputs, outputs) {
  var requestSysId = inputs.requestSysId;
  var adAccount = inputs.adAccount; // returned from Azure Function

  var req = new GlideRecord('u_onboarding_request');
  if(req.get(requestSysId)) {
    req.u_ad_account = adAccount;
    req.u_status = 'In Progress';
    req.update();
  }

  // create task to notify employee
  var task = new GlideRecord('task');
  task.initialize();
  task.short_description = 'AD account created: ' + adAccount;
  task.u_onboarding_request = requestSysId;
  task.insert();

})(inputs, outputs);
