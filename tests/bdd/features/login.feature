Feature: Login
  As a customer
  I want to log in to my account
  So that I can browse products and make purchases

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter username "standard_user" and password "secret_sauce"
    And I click the login button
    Then I should be on the inventory page
    And I should see the product list

  Scenario: Login fails for locked out user
    Given I am on the login page
    When I enter username "locked_out_user" and password "secret_sauce"
    And I click the login button
    Then I should see a login error containing "Sorry, this user has been locked out"

  Scenario: Login fails with wrong password
    Given I am on the login page
    When I enter username "standard_user" and password "wrong_password"
    And I click the login button
    Then I should see a login error containing "Username and password do not match"

  Scenario: Login fails with empty username
    Given I am on the login page
    When I enter username "" and password "secret_sauce"
    And I click the login button
    Then I should see a login error containing "Username is required"

  Scenario: User can log out
    Given I am logged in as a standard user
    When I open the menu and click logout
    Then I should be on the login page
