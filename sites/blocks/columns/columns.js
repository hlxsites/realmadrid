import { loadCSS } from '../../scripts/lib-franklin.js';
import { bindSwipeToElementWithForce } from '../../scripts/scripts.js';

function decorateOrganizeVisit(el) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/organize-visit.css`);
  [...el.children].forEach((row) => {
    row.classList.add('visit-box');
    if (row.children.length > 1) {
      const rowElements = [...row.children];
      rowElements[0].classList.add('icon-wrapper');
      rowElements[1].classList.add('text-wrapper');
      // remove buttons styling from stand-alone links
      rowElements[1].querySelectorAll('.button, .button-container')
        .forEach((button) => {
          button.classList.remove('button', 'button-container', 'primary');
        });
    }
  });
}

function decorateFullColumns(el) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/full-columns.css`);
  const elements = el.querySelectorAll(':scope > div > div');
  if (elements != null) {
    elements.forEach((element) => {
      Array.from(element.children).forEach((row, index) => {
        switch (index) {
          case 0:
            row.classList.add('image');
            break;
          case 1:
            row.classList.add('subtitle');
            break;
          case 2:
            row.classList.add('title');
            break;
          default:
            row.classList.add('text');
            break;
        }
      });
    });
  }
}

// make the swipe smooth
function smoothScrollToSlide(tabsWrapper, tabs, targetIndex) {
  const startPos = tabsWrapper.scrollLeft;
  const targetPos = tabs[targetIndex].offsetLeft;
  const change = targetPos - startPos;

  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const t = Math.min(1, elapsed / 500);
    tabsWrapper.scrollLeft = startPos + t * change;
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Tour-FAQ Fragment
  if (block.classList.contains('tour-faq')) {
    const tabsWrapper = document.createElement('div');
    tabsWrapper.classList.add('swiper-container', 'tour-faq-tabs');
    block.prepend(tabsWrapper);

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('tour-faq-content-wrapper');

    const tourFaqTabs = block.querySelectorAll('.columns > div');

    const tabs = []; // Array to store all the slide elements
    tourFaqTabs.forEach((tab, index) => {
      const tabTitleFirst = tab.firstElementChild;
      if (tabTitleFirst) {
        const newTab = document.createElement('div');
        newTab.innerHTML = tabTitleFirst.innerHTML;
        newTab.classList.add('swiper-slide');
        tabsWrapper.appendChild(newTab);
        tabTitleFirst.remove();
        tabs.push(newTab); // Add the new slide to the array

        newTab.addEventListener('click', (event) => {
          event.stopPropagation();
          tabsWrapper.querySelectorAll('div').forEach((tabTitle) => tabTitle.classList.remove('active'));
          newTab.classList.add('active');

          contentWrapper.querySelectorAll('div').forEach((div) => div.classList.remove('active'));
          tab.classList.add('active');
        });

        if (index === 1) {
          newTab.classList.add('active');
          tab.classList.add('active');
        }
      }
      // Remove the content panel from the block element before appending it to the content wrapper
      block.removeChild(tab);
    });

    // swipe events initialization for tabs using bindSwipeToElement
    let targetIndex = 0;
    const swipeThreshold = 100;
    bindSwipeToElementWithForce(tabsWrapper);
    tabsWrapper.addEventListener('swipe-RTL', (e) => {
      // Calculate how many tabs to scroll, round up to nearest whole number
      const scrollAmount = Math.ceil(e.detail.force / swipeThreshold);
      // If we're not at the last slide...
      if (targetIndex + scrollAmount < tabs.length) {
        targetIndex += scrollAmount;
        smoothScrollToSlide(tabsWrapper, tabs, targetIndex);
      }
    });
    tabsWrapper.addEventListener('swipe-LTR', (e) => {
      // Calculate how many tabs to scroll, round up to nearest whole number
      const scrollAmount = Math.ceil(e.detail.force / swipeThreshold);
      // If we're not at the first slide...
      if (targetIndex - scrollAmount >= 0) {
        targetIndex -= scrollAmount;
        smoothScrollToSlide(tabsWrapper, tabs, targetIndex);
      }
    });

    // Move the content panels into the new content wrapper div
    tourFaqTabs.forEach((tab, index) => {
      if (index === 0) {
        block.appendChild(tab);
      } else {
        contentWrapper.appendChild(tab);
      }
    });

    // Finally, append the content wrapper to the block element
    block.appendChild(contentWrapper);

    const contentDivs = contentWrapper.querySelectorAll('div');
    contentDivs.forEach((contentDiv) => {
      const questionParas = contentDiv.querySelectorAll('p > strong');
      questionParas.forEach((question, questionIndex) => {
        const para = question.parentElement;
        para.classList.add('question');
        question.classList.add('question');
        // Making sure that answers with many paragraphs get also the class answer
        let answer = para.nextElementSibling;
        while (answer && !answer.querySelector('strong')) {
          answer.classList.add('answer');
          answer = answer.nextElementSibling;
        }
        if (window.innerWidth <= 768) {
          question.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            if (event.target !== question) return;

            contentDiv.querySelectorAll('.question.open').forEach((otherQuestion) => {
              if (otherQuestion !== question) {
                otherQuestion.classList.remove('open');
                otherQuestion.classList.add('close');
                // Now we're closing every non-question paragraph that follows the clicked question
                answer = otherQuestion.parentElement.nextElementSibling;
                while (answer && !answer.querySelector('strong')) {
                  answer.classList.remove('open');
                  answer.classList.add('close');
                  answer = answer.nextElementSibling;
                }
              }
            });

            const isOpen = question.classList.contains('open');
            // We open or close the following non-question paragraphs
            answer = para.nextElementSibling;
            while (answer && !answer.querySelector('strong')) {
              if (isOpen) {
                question.classList.remove('open');
                question.classList.add('close');
                answer.classList.remove('open');
                answer.classList.add('close');
              } else {
                question.classList.remove('close');
                question.classList.add('open');
                answer.classList.remove('close');
                answer.classList.add('open');
              }
              answer = answer.nextElementSibling;
            }
          });
          // Display the first question's answer by default
          if (questionIndex === 0) {
            question.classList.add('open');
            // Mark the first answer paragraph as 'open' right at the beginning
            const firstAnswer = para.nextElementSibling;
            if (firstAnswer) firstAnswer.classList.add('open');
            // New modification ends here
          } else {
            question.classList.add('close');
            // Mark all non-question paragraphs as 'close' right at the beginning
            answer = para.nextElementSibling;
            while (answer && !answer.querySelector('strong')) {
              answer.classList.add('close');
              answer = answer.nextElementSibling;
            }
          }
        }
      });
    });
  }

  // customization for organize-visit-column
  if (block.classList.contains('organize-visit')) {
    decorateOrganizeVisit(block);
  }
  // customization for full-column
  if (block.classList.contains('full')) {
    decorateFullColumns(block);
  }
}
