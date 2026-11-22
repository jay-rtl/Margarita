document.querySelectorAll('.mg-site').forEach((site) => {
  const header = site.querySelector('.site-header');
  if (header) {
    const syncHeader = () => header.classList.toggle('at-page-top', window.scrollY <= 0);
    syncHeader();
    window.addEventListener('scroll', syncHeader, {passive:true});
    window.addEventListener('pageshow', syncHeader);
  }
  const bookingAccess = new URLSearchParams(window.location.search).get('flow') === 'booking';
  const accessIntro = site.querySelector('#access .form-intro');
  if (bookingAccess && accessIntro) {
    accessIntro.textContent = 'Enter your email to continue to the private session application.';
  }
  // Forminator can load its markup via AJAX. Set the intent before its submit handler serializes the form.
  site.addEventListener('submit', event => {
    const intent = event.target.elements?.namedItem('mg_access_flow');
    if (intent) intent.value = bookingAccess ? 'booking' : '';
  }, true);
  const toggle=site.querySelector('.menu-toggle'),nav=site.querySelector('.main-nav'),mobile=matchMedia('(max-width:800px)');
  const closeMenu=(focus=false)=>{site.classList.remove('menu-open');toggle?.setAttribute('aria-expanded','false');if(focus)toggle?.focus();};
  if(toggle&&nav){
    toggle.hidden=false;site.classList.add('is-enhanced');
    toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));site.classList.toggle('menu-open',open);});
    site.addEventListener('keydown',e=>{if(e.key==='Escape'&&site.classList.contains('menu-open'))closeMenu(true);});
    nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
    document.addEventListener('pointerdown',e=>{if(!site.querySelector('.site-header').contains(e.target))closeMenu();});
    site.querySelector('.site-header').addEventListener('focusout',e=>{if(mobile.matches&&!site.querySelector('.site-header').contains(e.relatedTarget))closeMenu();});
    mobile.addEventListener('change',()=>closeMenu());
  }
  // Add visible names where the original newsletter relied on placeholders.
  // Names, constraints, submission handlers and plugin states are untouched.
  site.querySelectorAll('.form-mount input:not([type=hidden]),.form-mount textarea,.form-mount select').forEach(field=>{
    if(field.id&&!site.querySelector(`label[for="${CSS.escape(field.id)}"]`)){
      const label=document.createElement('label');label.htmlFor=field.id;label.className='form-label';label.textContent=field.type==='email'?'Email address *':'Full name';field.closest('.forminator-field')?.prepend(label);
    }
  });
  // This attribute exists only in local review. WordPress uses live Forminator.
  site.querySelectorAll('form[data-preview-form]').forEach(form=>{
    const submit=form.querySelector('button[type=submit]'),status=form.querySelector('.preview-status');
    const fields=[...form.querySelectorAll('input:not([type=hidden]),textarea,select')];
    const clearError=field=>{
      const errorId=`${field.id}-preview-error`;form.querySelector(`#${CSS.escape(errorId)}`)?.remove();field.removeAttribute('aria-invalid');
      const ids=(field.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&id!==errorId);
      if(ids.length)field.setAttribute('aria-describedby',ids.join(' '));else field.removeAttribute('aria-describedby');
    };
    fields.forEach(field=>field.addEventListener('input',()=>clearError(field)));
    form.addEventListener('submit',event=>{
      event.preventDefault();status.replaceChildren();let firstInvalid;
      for(const field of fields){
        clearError(field);
        if(!field.checkValidity()){
          firstInvalid ||= field;
          const error=document.createElement('span');error.id=`${field.id}-preview-error`;error.className='preview-error';error.textContent=field.validity.valueMissing?'Please complete this field.':field.type==='email'?'Enter a valid email address.':'Please check this value.';
          field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',`${field.getAttribute('aria-describedby')||''} ${error.id}`.trim());field.closest('.forminator-field')?.append(error);
        }
      }
      if(firstInvalid){status.textContent='Please check the highlighted fields. Nothing has been sent.';firstInvalid.focus();return;}
      if(form.dataset.previewForm==='352'){
        window.location.assign(bookingAccess ? 'application-form/#booking-form' : 'landing-page/');
        return;
      }
      status.textContent='The fields passed the preview checks. Nothing has been sent. ';
      if(!form.dataset.liveUrl) return;
      const link=document.createElement('a');link.href=form.dataset.liveUrl;link.textContent='Continue to the live form to submit.';link.target='_blank';link.rel='noopener noreferrer';status.append(link);
    });
    if(submit)submit.disabled=false;
  });
  if(document.body.dataset.preview==='true'){
    site.querySelectorAll('.cookie-preferences').forEach(button=>button.addEventListener('click',()=>{
      let dialog=site.querySelector('.cookie-dialog');
      if(!dialog){dialog=document.createElement('dialog');dialog.className='cookie-dialog';dialog.setAttribute('aria-labelledby','cookie-dialog-title');dialog.innerHTML='<h2 id="cookie-dialog-title">Preview privacy</h2><p>This local design preview uses no optional cookies or tracking. Form entries stay in this page and are not sent or saved.</p><button type="button" class="button">Close</button>';site.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());}
      dialog.showModal();
    }));
  }
});
