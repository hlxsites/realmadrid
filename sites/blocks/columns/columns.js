import { loadCSS } from '../../scripts/lib-franklin.js';

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

    tourFaqTabs.forEach((tab, index) => {
      const tabTitleFirst = tab.firstElementChild;
      if (tabTitleFirst) {
        const newTab = document.createElement('div');
        newTab.innerHTML = tabTitleFirst.innerHTML;
        newTab.classList.add('swiper-slide');
        tabsWrapper.appendChild(newTab);
        tabTitleFirst.remove();

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
        const answer = question.parentElement.nextElementSibling;
        answer.classList.add('answer');
        if (window.innerWidth <= 768) {
          question.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            if (event.target !== question) return;

            contentDiv.querySelectorAll('.question.open').forEach((otherQuestion) => {
              if (otherQuestion !== question) {
                otherQuestion.classList.remove('open');
                otherQuestion.classList.add('close');
                otherQuestion.parentElement.nextElementSibling.classList.remove('open');
                otherQuestion.parentElement.nextElementSibling.classList.add('close');
              }
            });

            const isOpen = question.classList.contains('open');
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
          });
          // Display the first question's answer by default
          if (questionIndex === 0) {
            question.classList.add('open');
            answer.classList.add('open');
          } else {
            question.classList.add('close');
            answer.classList.add('close');
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
