import memoize from 'fast-memoize';
import {assignDeep} from '../utils/util';
import {cleanseTags} from '../utils/filterUtils';

// lessonSrc/*/*/lesson.yml
const lessonsContext =
  require.context('lessonSrc/', true, /^[.][/][^/]+[/][^/]+[/]lesson[.]yml$/);

/**
 * Get language independent data on all lessons from lesson.yml files.
 * @returns {object} An object of lessons, e.g.
 * {
 *   scratch: {
 *     astrokatt: {
 *       indexed: false, // true unless 'indexed: false' explicitly exists in lesson.yml
 *       level: 1,
 *       license: '[cc-by-sa 3.0](http://creativecommons.org/licenses/by-sa/3.0/)'
 *       tags: {
 *         topic: ['block_based', 'app'],
 *         subject: ['technology', 'programming'],
 *         grade: ['secondary', 'junior'],
 *       }
 *     },
 *     straffespark: {
 *       ...
 *     },
 *   },
 *   python: {
 *     ...
 *   },
 *   ...
 * }
 */
const getData = memoize(
  () => {
    const lessons = {};
    for (const key of lessonsContext.keys()) {
      const [/* ignore */, course, lesson] = key.match(/^[.][/]([^/]+)[/]([^/]+)[/]lesson[.]yml$/);
      const {level, license, tags, indexed} = lessonsContext(key);
      const isIndexed = indexed !== false;
      if (!level && isIndexed) { console.warn(`The indexed lesson ${course}/${lesson} is missing 'level'.`); }
      const data = {level, license, tags: cleanseTags(tags, key), isIndexed};
      assignDeep(lessons, [course, lesson], data);
    }
    return lessons;
  }
);


/**
 * Return tags for this lesson.
 * @param {string} course
 * @param {string} lesson
 * @returns {object} A Metadata object, e.g. {
    isIndexed: false,
    tags: {
      topic: ['block_based', 'app'],
      subject: ['technology', 'programming'],
      grade: ['secondary', 'junior'],
    }
  }
  If 'indexed' === false it won't show up using the filter in "all lessons",
  but can be used as an "instruction lesson" in e.g the playlist or in course info.
  Note that instructions for a specific lessons should be named README[_xx].md in
  that the lesson folder.
 */
const getLessonMetadata = (course, lesson) => (getData()[course] || {})[lesson] || {};

/**
 * Returns whether or not a lesson.yml file exists for this lesson
 * @param course
 * @param lesson
 * @return {boolean}
 */
export const isLesson = (course, lesson) => !!((getData()[course] || {})[lesson]);

/**
 * Get lesson tags (without language included)
 * @param {string} course E.g. 'scratch'
 * @param {string} lesson E.g. 'astrokatt'
 * @returns {object} A lessonTags object, e.g.
 * {
 *   topic: ['block_based', 'app'],
 *   subject: ['technology', 'programming'],
 *   grade: ['secondary', 'junior'],
 * }
 */
export const getLessonTags = (course, lesson) => getLessonMetadata(course, lesson).tags;

/**
 * Whether or not a lesson is indexed, i.e. if it should be shown when displaying filtered lessons per level
 * @param {string} course E.g. 'scratch'
 * @param {string} lesson E.g. 'astrokatt'
 * @returns {boolean} Whether or not the lesson is indexed
 */
export const isLessonIndexed = (course, lesson) => getLessonMetadata(course, lesson).isIndexed;

/**
 * Get license for lesson.
 * @param {string} course E.g. 'scratch'
 * @param {string} lesson E.g. 'astrokatt'
 * @returns {string} The license for the lesson. Defaults to '', if course, lesson or license was not found
 */
export const getLicense = (course, lesson) => ((getData()[course] || {})[lesson] || {}).license || '';

/**
 * Get level for lesson.
 * @param {string} course E.g. 'scratch'
 * @param {string} lesson E.g. 'astrokatt'
 * @returns {number} The level of the lesson. Defaults to 0 if course, lesson or level was not found.
 */
export const getLevel = (course, lesson) => ((getData()[course] || {})[lesson] || {}).level || 0;

/**
 * Get lessons in a course, sorted alphabetically. Will return all lessons that have a lesson.yml file.
 * @param {string} course E.g. 'scratch'
 * @returns {string[]} An array of lessons for the given course, e.g. ['astrokatt', 'straffespark']
 */
export const getLessonsInCourse = memoize(course => Object.keys(getData()[course] || {}).sort());
