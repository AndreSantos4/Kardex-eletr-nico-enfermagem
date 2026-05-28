function sidebarNavegar(e, page) {
    e.preventDefault();
    const id = new URLSearchParams(window.location.search).get('id');
    window.location.href = id ? page + '?id=' + id : page;
}
