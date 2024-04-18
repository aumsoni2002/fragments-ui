import { Auth, getUser } from "./auth";
import {
  fetchUserFragments,
  createNewFragment,
  fetchFragmentById,
  updateFragmentById,
  deleteFragmentById,
  fetchConvertedFragmentById,
} from "./api";

async function init() {
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const fragmentList = document.getElementById("fragmentList");
  const createForm = document.getElementById("createForm");
  const updateForm = document.getElementById("updateForm");
  const viewModal = document.getElementById("viewModal");
  const updateModal = document.getElementById("updateModal");
  const deleteModal = document.getElementById("deleteModal");
  const viewFragmentContent = document.getElementById("viewFragmentContent");
  const updateFragmentContent = document.getElementById(
    "updateFragmentContent"
  );
  const extensionInput = document.getElementById("extensionInput");
  const convertBtn = document.getElementById("convertBtn");
  const confirmDelete = document.getElementById("confirmDelete");
  const imageFragment = document.querySelector("#imageFragment");
  const updateImageFragment = document.querySelector("#updateImageFragment");

  loginBtn.onclick = () => {
    Auth.federatedSignIn();
  };

  logoutBtn.onclick = () => {
    Auth.signOut();
  };

  const user = await getUser();
  if (!user) {
    logoutBtn.style.display = "none"; // Hide logout button if user is not logged in
    return;
  }

  // Log user details
  console.log("User details:", user);

  userSection.hidden = false;
  userSection.querySelector(".username").innerText = user.username;
  loginBtn.style.display = "none"; // Hide login button if user is logged in
  logoutBtn.style.display = "block"; // Show logout button

  // Function to display fragments
  async function displayFragments(user) {
    fragmentList.innerHTML = ""; // Clear existing fragment list
    const res = await fetchUserFragments(user);
    if (res.fragments && res.fragments.length > 0) {
      res.fragments.forEach((fragment) => {
        const li = document.createElement("li");
        li.innerHTML = `<div>ID: ${fragment.id}</div>
                     <div>Type: ${fragment.type}</div>
                     <div>Created: ${new Date(
                       fragment.created
                     ).toLocaleString()}</div>
                     <div>Updated: ${new Date(
                       fragment.updated
                     ).toLocaleString()}</div>
                     <div>Size: ${fragment.size}</div>
                     <div>Owner ID: ${fragment.ownerId}</div>
                     <div>
                       <button class="deleteBtn" data-id="${
                         fragment.id
                       }">Delete</button>
                       <button class="updateBtn" data-id="${
                         fragment.id
                       }">Update</button>
                     </div>`;
        fragmentList.appendChild(li);
      });
    } else {
      fragmentList.innerHTML = "<li>No fragments found.</li>";
    }
  }

  await displayFragments(user); // Display user's fragments on page load

  createForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form submission
    const fragmentType = document.getElementById("fragmentType").value;
    const fragmentContentValue =
      document.getElementById("fragmentContent").value;

    try {
      let res;
      if (fragmentType.startsWith("image/")) {
        res = await createNewFragment(
          user,
          imageFragment.files[0],
          fragmentType
        );
      } else {
        res = await createNewFragment(user, fragmentContentValue, fragmentType);
      }
      await displayFragments(user); // Refresh fragment list
      // Clear the form fields
      document.getElementById("fragmentType").value = "text/plain";
      document.getElementById("fragmentContent").value = "";
      document.getElementById("imageFragment").value = "";
    } catch (error) {
      console.error("Failed to create fragment:", error);
      alert("Failed to create fragment. Please try again.");
    }
  });

  // View fragment modal
  fragmentList.addEventListener("click", async (event) => {
    if (
      event.target.tagName === "DIV" &&
      event.target.parentElement.tagName === "LI"
    ) {
      const fragmentId = event.target.parentElement
        .querySelector("div:first-child")
        .innerText.split(":")[1]
        .trim();
      const { data, fragmentType } = await fetchFragmentById(user, fragmentId);

      if (fragmentType.startsWith("image/")) {
        viewFragmentContent.innerHTML = `<img src="${data}" style="max-width: 100%; height: auto;">`;
      } else if (fragmentType === "application/json") {
        viewFragmentContent.textContent = JSON.stringify(data); // Format the JSON data
      } else {
        viewFragmentContent.textContent = data;
      }

      extensionInput.value = fragmentType.split("/")[1];
      viewModal.style.display = "block";
      document.querySelectorAll("#fragmentList li").forEach((li) => {
        li.classList.remove("selected");
      });
      event.target.parentElement.classList.add("selected");
    }
  });

  // Update fragment modal
  fragmentList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("updateBtn")) {
      const fragmentId = event.target.getAttribute("data-id");
      const { data, fragmentType } = await fetchFragmentById(user, fragmentId);

      if (fragmentType.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = data;
        img.style.width = "100%";
        img.id = `${fragmentId}.image`;
        updateFragmentContent.appendChild(img);
        updateImageFragment.type = "file";
        updateImageFragment.accept = "image/*";
      } else if (fragmentType === "application/json") {
        updateFragmentContent.value = JSON.stringify(data); // Format the JSON data
      } else {
        updateFragmentContent.value = data;
        updateImageFragment.type = "hidden";
      }

      updateModal.style.display = "block";

      updateForm.onsubmit = async (evt) => {
        evt.preventDefault();

        if (fragmentType.startsWith("image/")) {
          try {
            await updateFragmentById(
              user,
              updateImageFragment.files[0],
              fragmentId,
              updateImageFragment.files[0].type
            );
            updateImageFragment.value = "";
          } catch (err) {
            console.error(err);
            alert("Failed to update fragment. Please try again.");
          }
        } else {
          const fragmentCurrContent = updateFragmentContent.value;
          try {
            await updateFragmentById(
              user,
              fragmentCurrContent,
              fragmentId,
              fragmentType
            );
          } catch (err) {
            console.error(err);
            alert("Failed to update fragment. Please try again.");
          }
        }

        await displayFragments(user); // Refresh fragment list
        updateModal.style.display = "none";
      };
    }
  });

  // Delete fragment modal
  fragmentList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("deleteBtn")) {
      const fragmentId = event.target.getAttribute("data-id");
      confirmDelete.onclick = async () => {
        try {
          await deleteFragmentById(user, fragmentId);
        } catch (err) {
          console.error(err);
          alert("Failed to delete fragment. Please try again.");
        }
        await displayFragments(user); // Refresh fragment list
        deleteModal.style.display = "none";
      };
      deleteModal.style.display = "block";
    }
  });

  // Close modal
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.onclick = () => {
      viewModal.style.display = "none";
      updateModal.style.display = "none";
      deleteModal.style.display = "none";
      updateFragmentContent.innerHTML = "";
    };
  });

  // Convert fragment
  convertBtn.onclick = async () => {
    const extension = extensionInput.value;

    // Get the fragment ID from the clicked fragment in the list
    const fragmentId = document
      .querySelector("#fragmentList li.selected")
      .querySelector("div:first-child")
      .innerText.split(":")[1]
      .trim();

    try {
      const { data } = await fetchConvertedFragmentById(
        user,
        fragmentId,
        extension
      );

      // Display the converted data in the view modal
      if (extension.startsWith("image/")) {
        viewFragmentContent.innerHTML = `<img src="${data}" style="max-width: 100%; height: auto;">`;
      } else if (fragmentType === "application/json") {
        viewFragmentContent.textContent = JSON.stringify(data); // Format the JSON data
      } else {
        viewFragmentContent.textContent = data;
      }

      viewModal.style.display = "block";
    } catch (error) {
      console.error("Failed to convert fragment:", error);
      alert(`Failed to convert fragment: ${error.message}`);
    }
  };
}

addEventListener("DOMContentLoaded", init);
