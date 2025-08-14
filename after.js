(function executeRule(current, previous /*null when insert*/) {
  try {
    // create basic tasks using Script Include
    var helper = new u_OnboardHelper();
    helper.createITTask(current.sys_id, 'Provision laptop for ' + current.u_employee_name);
    helper.createADTask(current.sys_id, current.u_employee_email);
    helper.updateRequestStatus(current.sys_id, 'In Progress');
  } catch (ex) {
    gs.error('Onboarding Business Rule error: ' + ex);
  }
})(current, previous);
