Feature: hackernews.com
  Background:
    Given I am in "https://news.ycombinator.com/news"
  @many
  Scenario Outline: viewing profile 4
  When I click the button/link ".morelink"
  And I click user number "4"
  Then the url should have "new"

  Examples:
  |test|
  |test1|