export const modifyAppWrapperElements = (): void => {
    const breadcrumbsWrapper = document.getElementById('breadcrumbs');
    if (breadcrumbsWrapper) {
        breadcrumbsWrapper.remove();
    }
};