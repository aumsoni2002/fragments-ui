// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || "http://localhost:8080";

/**
 * Retrieve list of fragments for the user
 */
export async function fetchUserFragments(user) {
  console.log("Fetching user fragments...");

  try {
    const response = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      method: "GET",
      headers: user.authorizationHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve fragments.");
    }

    const responseData = await response.json();

    if (responseData.fragments.length > 0) {
      console.log(
        `Successfully retrieved ${responseData.fragments.length} fragment(s):`,
        { responseData }
      );
    } else {
      console.log("No fragments found for the user.");
    }

    return responseData;
  } catch (error) {
    console.error("Error fetching user fragments:", error.message);
    throw error;
  }
}

/**
 * Create a new fragment
 */
export async function createNewFragment(user, fragmentContent, contentType) {
  console.log("Creating a new fragment...");

  try {
    const response = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        "Content-Type": contentType,
      },
      body: fragmentContent,
    });

    if (!response.ok) {
      throw new Error("Failed to create a new fragment.");
    }

    const responseData = await response.json();
    console.log("Successfully created new fragment:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error creating new fragment:", error.message);
    throw error;
  }
}
