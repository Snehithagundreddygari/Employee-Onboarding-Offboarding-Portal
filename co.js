// Accessible from server-side flows
var u_OnboardHelper = Class.create();
u_OnboardHelper.prototype = {
  initialize: function() {},

  createITTask: function(requestSysId, shortDesc, assignedToSysId) {
    var gr = new GlideRecord('task');
    gr.initialize();
    gr.short_description = shortDesc;
    gr.u_onboarding_request = requestSysId;
    gr.assignment_group = this._getITGroupId();
    if(assignedToSysId) gr.assigned_to = assignedToSysId;
    gr.u_type = 'IT Provisioning';
    gr.insert();
  },

  createADTask: function(requestSysId, email) {
    var gr = new GlideRecord('task');
    gr.initialize();
    gr.short_description = 'Create AD account for ' + email;
    gr.u_onboarding_request = requestSysId;
    gr.u_type = 'AD Provisioning';
    gr.insert();
  },

  _getITGroupId: function(){
    var g = new GlideRecord('sys_user_group');
    g.addQuery('name','IT Support');
    g.query();
    return g.next() ? g.sys_id.toString() : '';
  },

  updateRequestStatus: function(requestSysId, status) {
    var r = new GlideRecord('u_onboarding_request');
    if(r.get(requestSysId)) {
      r.u_status = status;
      r.update();
    }
  },

  type: 'u_OnboardHelper'
};
