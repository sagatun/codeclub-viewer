// lessonSrc/*/logo-black.png
export const iconContext =
  require.context('lessonSrc/', true, /^[.][/][^/]+[/]logo-black[.]png$/);

/**
 * Get the URI for the course icon to be used as the "src" argument in <img> tags
 * @param {string} course E.g. 'scratch'
 * @returns {string | null} E.g. '/_/oppgaver/src/appinventor/logo-black.3695fe.png'
 */
export const getCourseIcon = (course) => {
  const path = `./${course}/logo-black.png`;
  return iconContext.keys().includes(path) ? iconContext(path) : null;
};
