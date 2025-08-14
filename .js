function onSubmit() {
  var email = g_form.getValue('employee_email');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid company email');
    return false;
  }
  return true;
}
