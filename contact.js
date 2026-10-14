'use strict';
(()=>{
  const {t,language}=window.portfolioI18n;
  const dialog=document.querySelector('#contact-dialog');
  if(!dialog)return;
  const form=dialog.querySelector('#contact-form');
  form.noValidate=true;
  const close=dialog.querySelector('.contact-dialog-close');
  const status=dialog.querySelector('#contact-form-status');
  let opener=null;

  document.querySelectorAll('[data-contact-trigger]').forEach(trigger=>{
    trigger.addEventListener('click',event=>{
      event.preventDefault();
      opener=trigger;
      const menu=document.querySelector('#compact-menu');
      const menuButton=document.querySelector('.menu-toggle');
      if(menu){menu.hidden=true;menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label',t('Open menu'));}
      status.hidden=true;
      dialog.showModal();
      document.body.classList.add('dialog-open');
      document.dispatchEvent(new CustomEvent('portfolio:dialog-open',{detail:dialog}));
      close.focus({preventScroll:true});
    });
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('dialog-open');
    document.dispatchEvent(new CustomEvent('portfolio:dialog-close'));
    const target=opener?.getClientRects().length?opener:document.querySelector('.menu-toggle');
    target?.focus({preventScroll:true});
  });
  // Native dialog handles Escape, background inertness and the focus trap.
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const name=form.elements.namedItem('name');
    const email=form.elements.namedItem('email');
    const subject=form.elements.namedItem('subject');
    for(const field of [name,email,subject])field.value=field.value.trim();
    const missingMessages={name:'Please enter your name.',email:'Please enter your email address.',subject:'Please enter a subject.',project_type:'Please choose a project type.',timeline:'Please choose a timeline.',budget:'Please choose a budget range.'};
    for(const field of form.querySelectorAll('input')){
      field.setCustomValidity('');
      if(field.validity.valueMissing)field.setCustomValidity(t(missingMessages[field.name]));
      else if(field.validity.typeMismatch)field.setCustomValidity(t('Please enter a valid email address.'));
      else if(field.validity.tooLong)field.setCustomValidity(t(`Please use ${field.maxLength} characters or fewer.`));
    }
    if(!form.reportValidity())return;
    const projectType=t(form.elements.namedItem('project_type').value);
    const timeline=t(form.elements.namedItem('timeline').value);
    const budget=t(form.elements.namedItem('budget').value);
    const body=language==='es'?`Hola, hugx.\n\nMi nombre es ${name.value}.\nMi correo de contacto es ${email.value}.\n\nMe gustaría conversar sobre: ${subject.value}\n\nTipo de proyecto: ${projectType}\nPlazo: ${timeline}\nPresupuesto: ${budget}\n\n`:`Hi, hugx.\n\nMy name is ${name.value}.\nYou can reach me at ${email.value}.\n\nI would like to discuss: ${subject.value}\n\nProject type: ${projectType}\nTimeline: ${timeline}\nBudget: ${budget}\n\n`;
    const url=`mailto:itshugx@gmail.com?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(body)}`;
    status.textContent=t('Your email draft is ready. Review and send it from your email app. If it does not open, use the “I prefer to email directly” link.');
    status.hidden=false;
    window.location.href=url;
  });
  form.addEventListener('input',event=>{
    if(event.target instanceof HTMLInputElement){
      for(const field of form.querySelectorAll('input'))if(field.name===event.target.name)field.setCustomValidity('');
    }
    status.hidden=true;
  });
})();
