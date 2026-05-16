Feature: Checkout
  As a customer
  I want to complete a purchase
  So that I can receive the products I selected

  Background:
    Given I am logged in as a standard user

  Scenario: Successful checkout with a single item
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I enter my shipping details as "Jane" "Doe" "10001"
    And I confirm my order
    Then I should see the order confirmation message "Thank you for your order"
    And my cart should be empty

  Scenario: Successful checkout with multiple items
    Given I add "Sauce Labs Backpack" to my cart
    And I add "Sauce Labs Bike Light" to my cart
    When I proceed to checkout
    And I enter my shipping details as "John" "Smith" "90210"
    And I confirm my order
    Then I should see the order confirmation message "Thank you for your order"

  Scenario: Checkout fails when first name is missing
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I enter my shipping details as "" "Doe" "10001"
    Then I should see a checkout error containing "First Name is required"

  Scenario: Checkout fails when last name is missing
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I enter my shipping details as "Jane" "" "10001"
    Then I should see a checkout error containing "Last Name is required"

  Scenario: Checkout fails when postal code is missing
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I enter my shipping details as "Jane" "Doe" ""
    Then I should see a checkout error containing "Postal Code is required"

  Scenario: Customer can cancel checkout and return to cart
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I cancel the checkout
    Then I should be on the cart page

  Scenario: Order total is calculated correctly
    Given I add "Sauce Labs Backpack" to my cart
    When I proceed to checkout
    And I enter my shipping details as "Jane" "Doe" "10001"
    Then the order total should be greater than zero
    And the order total should include tax
