"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/** Favorites list on page */

function putFavoritesListOnPage(){
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if(currentUser.favorites.length === 0){
    $favoritedStories.append("<h5> No favorites</h5>");
  }
  else{
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

/** Create new story when submitted the form*/
async function createNewStory(evt){
  console.debug("createNewStory");
  evt.preventDefault();
  
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username} ;
  const story = await storyList.addStory(currentUser, storyData);
  const $markupStory = generateStoryMarkup(story);
  $allStoriesList.prepend($markupStory)
  $storySubmitForm.slideUp('slow');
  $storySubmitForm.trigger('reset');
}
$storySubmitForm.on('submit', createNewStory);

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, displayDelBtn) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showFav = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
       <div>
       ${showFav ? getFavMarkup(story, currentUser) : ""} 
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

function getFavMarkup(story, user) {
  const isFavorite = user.isFavorite(story);
  const favType = isFavorite ? "fas" : "far";
  return `
    <span class="star">
      <i class="${favType} fa-star"></i>
    </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $myStories.empty();

  if (currentUser.ownStories.length === 0) {
    $myStories.append("<h5>No stories added by user!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }
  $myStories.show();
}

async function toggleStoryFav(evt) {
  console.debug("toggleStoryFav");
  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  if($target.hasClass("fas")){
    await currentUser.removeFavorite(story);
   } else {
    await currentUser.addFavorite(story);
  }
  $target.closest("i").toggleClass("fas far");
}
$storiesLists.on("click", ".star", toggleStoryFav);
