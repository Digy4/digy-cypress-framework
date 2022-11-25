Feature: hackernews.com
  Background:
    Given I am in "https://news.ycombinator.com/news"

  Scenario: viewing profile 10
  When I click the button/link ".morelink"
  And I click user number "10"
  Then the url should have "new"