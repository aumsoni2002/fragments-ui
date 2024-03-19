// src/app.js

import { Auth, getUser } from "./auth";
import { fetchUserFragments, createNewFragment } from "./api";

async function init() {
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");

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

  const fragmentList = document.getElementById("fragmentList");

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
                     <div>Owner ID: ${fragment.ownerId}</div>`;
        fragmentList.appendChild(li);
      });
    } else {
      fragmentList.innerHTML = "<li>No fragments found.</li>";
    }
  }

  await displayFragments(user); // Display user's fragments on page load

  const createForm = document.getElementById("createForm");
  createForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form submission
    const fragmentType = document.getElementById("fragmentType").value;
    const fragmentContent = document.getElementById("fragmentContent").value;
    try {
      await createNewFragment(user, fragmentContent, fragmentType); // Create new fragment
      await displayFragments(user); // Refresh fragment list
      // Clear the form fields
      document.getElementById("fragmentType").value = "text/plain";
      document.getElementById("fragmentContent").value = "";
    } catch (error) {
      console.error("Failed to create fragment:", error);
      alert("Failed to create fragment. Please try again.");
    }
  });
}

addEventListener("DOMContentLoaded", init);
