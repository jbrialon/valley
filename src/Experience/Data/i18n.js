import { isTouchDevice } from "../Utils/Utils";

const isTouch = isTouchDevice();
export default {
  en: {
    loader: {
      0: "Initiating launch sequence...",
      1: "Loading the digital stuff...",
      2: "Calibrating the flux...",
      3: "loading aesthetics...",
      4: "scaling bananas...",
      5: "procedurally generating worlds...",
      6: "brewing coffee for the developer...",
      7: "waking up the pixels...",
      8: "counting stars in the database...",
      9: "untangling the Internet cables...",
      10: "polishing screen pixels...",
      11: "watering the cloud plants...",
      12: "tuning in to the right frequencies",
      13: "blending colors for the perfect palette...",
      14: "whispering secrets to the firewall...",
      15: "herding cats in the backend...",
      16: "convincing the elements to cooperate...",
      17: "deploying invisible bugs...",
      18: "hiring cats for tech support...",
      19: "summoning internet spirits...",
    },
    menu: {
      start: "Normal mode",
      game: "Game mode",
    },
    title: {
      paragraph:
        'Follow our footsteps in an <span class="bold">Exploration Experiment</span> through <strong>Nepal</strong>, uncovering hidden photos and moments from our two-week trek as you go.',
    },
    chapter: {
      title0: "Chapter 1",
      subtitle0: "Langtang  Valley",
      title1: "Chapter 2",
      subtitle1: "Acclimatization",
    },
    tooltip: {
      tutorial: {
        one: 'The goal is to reveal hidden <span class="bold">Milestones</span> on a map and uncover photos from our two-week trek.',
        two: isTouch
          ? 'The goal is to reveal hidden <span class="bold">Milestones</span> on a map and uncover photos from our two-week trek. <br /><br /><span class="bold">Long Touch/Tap</span> on the map to search for a <span class="bold">Milestone</span>.'
          : 'The goal is to reveal hidden <span class="bold">Milestones</span> on a map and uncover photos from our two-week trek. <br /><br />Use your <span class="bold">Mouse</span> and <span class="bold">Hold Click</span> on the map to search for a <span class="bold">Milestone</span>.',
        three: isTouch
          ? '<span class="bold">Slide Two Fingers</span> up or down to <span class="bold">Scroll</span> along the valley.'
          : '<span class="bold">Scroll</span> can be used to travel along the valley.',
        four: 'And <span class="bold">Reveal</span> the next <span class="bold">Milestone</span> of our journey.',
        five: isTouch
          ? '<span class="bold">Tap</span> on the <span class="bold">Milestone</span> to discover more about it! keep track your progress with your <span class="bold">Travel log!</span>'
          : '<span class="bold">Click</span> on the <span class="bold">Milestone</span> to discover more about it! keep track your progress with your <span class="bold">Travel log!</span>',
      },
      message: {
        later: "I can't go there yet, but I can come back later.",
        missed:
          'I must have missed a <span class="bold">Milestone</span> along the way...',
        achievement: '<span class="bold">Achievement!</span> you found {0}',
      },
    },
  },
};
