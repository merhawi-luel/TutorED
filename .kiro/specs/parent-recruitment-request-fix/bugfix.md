# Bugfix Requirements Document

## Introduction

Parents using the "Find a Tutor" feature encounter an "Internal server error" when attempting to post recruitment requests (either agency-assisted or self-recruitment mode). The error occurs after selecting subjects (e.g., Mathematics, Chemistry, English), grades (e.g., Grade 1, Grade 8), filling in contact information and location, and clicking the "Post Request" button. The backend returns a 500 status code with a generic "Internal server error" message, preventing parents from successfully submitting their recruitment needs. This blocks a critical user journey in the parent workflow and prevents the core matching functionality of the platform from working.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a parent submits a recruitment request with selected subjects and grades (arrays) THEN the system returns HTTP 500 "Internal server error"

1.2 WHEN the backend attempts to insert the recruitment request into the `recruitment_requests` table THEN the system encounters a database constraint violation or data type mismatch

1.3 WHEN the backend error occurs THEN the system logs only "Contact agency error:" without exposing the specific database error details to help diagnose the issue

1.4 WHEN the frontend receives the 500 error THEN the system displays a generic red error banner stating "Internal server error" without actionable information for the user

### Expected Behavior (Correct)

2.1 WHEN a parent submits a recruitment request with valid subjects and grades arrays THEN the system SHALL successfully insert the record into the `recruitment_requests` table and return HTTP 201 with the created request object

2.2 WHEN the backend receives recruitment request data with organizationId as undefined (self-recruitment mode) THEN the system SHALL correctly handle the nullable organizationId field and store NULL in the database

2.3 WHEN a database error occurs during insertion THEN the system SHALL log the detailed error information (including constraint violations, type mismatches) to help diagnose issues

2.4 WHEN the recruitment request is successfully created THEN the system SHALL display a success message with a link to view the parent's requests

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a parent submits a recruitment request without required fields (empty subjects or grades) THEN the system SHALL CONTINUE TO return HTTP 400 with error message "At least one subject and one grade are required"

3.2 WHEN a parent successfully creates a recruitment request THEN the system SHALL CONTINUE TO allow retrieval of their requests via GET `/api/parent/requests`

3.3 WHEN a parent views their recruitment requests THEN the system SHALL CONTINUE TO enrich each request with the organization name if organizationId is present

3.4 WHEN an agency views recruitment requests THEN the system SHALL CONTINUE TO access requests assigned to their organization via GET `/api/agency/requests`

3.5 WHEN the frontend submits request data THEN the system SHALL CONTINUE TO include parentName, parentEmail from user context and parentPhone from the form input

3.6 WHEN authentication is missing or invalid THEN the system SHALL CONTINUE TO return appropriate authentication errors via the requireAuth middleware
