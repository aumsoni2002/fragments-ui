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

/**
 * GET /v1/fragments/:id
 */
export async function fetchFragmentById(user, fragmentId) {
  console.log("Fetching user fragment by id...");

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "GET",
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw await res.json();
    }

    let data;
    const fragmentType = res.headers.get("Content-Type");

    if (fragmentType.startsWith("text/")) {
      data = await res.text();
    } else if (fragmentType.startsWith("application/")) {
      data = await res.json();
    } else if (fragmentType.startsWith("image/")) {
      const blob = await res.blob();
      data = URL.createObjectURL(blob);
    }

    console.log("Success in retrieving fragment data: ", { data });

    return { data, fragmentType };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * PUT /v1/fragments/:id
 */
export async function updateFragmentById(
  user,
  content,
  fragmentId,
  fragmentType
) {
  console.log("Updating fragment by id...");

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "PUT",
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        "Content-Type": fragmentType,
      },
      body: content,
    });

    if (!res.ok) {
      throw await res.json();
    }

    const data = await res.json();

    console.log("Success in updating fragment data: ", { data });

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * DELETE /v1/fragments/:id
 */
export async function deleteFragmentById(user, id) {
  console.log("deleting fragment by id...");

  return await fetch(`${apiUrl}/v1/fragments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: user.authorizationHeaders().Authorization,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw res.json();
      }
      return res.json();
    })
    .then((data) => {
      console.log("Success in deleting fragment: ", { data });
      return data;
    })
    .catch((err) => {
      console.error(err);
    });
}

/**
 * Fetch converted fragment by id and extension
 */
export async function fetchConvertedFragmentById(user, fragmentId, extension) {
  const extensionType = getExtensionContentType(extension);
  if (!extensionType) {
    throw new Error(`Unsupported extension: ${extension}`);
  }

  console.log(
    `Fetching from URL: ${apiUrl}/v1/fragments/${fragmentId}.${extension}`
  );

  try {
    const response = await fetch(
      `${apiUrl}/v1/fragments/${fragmentId}.${extension}`,
      {
        method: "GET",
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          Accept: extensionType,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let data;
    if (extension.startsWith("image/")) {
      const blob = await response.blob();
      data = URL.createObjectURL(blob);
    } else if (extensionType === "application/json") {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { data };
  } catch (error) {
    throw new Error(`Error retrieving converted fragment: ${error.message}`);
  }
}

// getting extension as per its respective content type
const getExtensionContentType = (extension) => {
  switch (extension) {
    case "txt":
      return "text/plain";
    case "md":
      return "text/markdown";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
};
