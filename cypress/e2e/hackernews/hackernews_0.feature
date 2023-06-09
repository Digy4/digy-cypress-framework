Feature: hackernews.com
  Background:
    Given I am in "https://news.ycombinator.com/news"
  @many
  Scenario: viewing profile 0
  When I click the button/link ".morelink"
  And I click user number "0"
  Then the url should have "new"