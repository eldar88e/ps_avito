window.closeModal = function() {
    document.getElementById('mainModal').classList.remove('show');
    document.getElementById('mainModal').style.display = 'none';
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.querySelector('.modal-backdrop').remove();
};
