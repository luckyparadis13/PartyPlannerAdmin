// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-Lucky";
const RESOURCE = "/events";
const API = BASE + COHORT + RESOURCE;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API);
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API.replace("/events", "/rsvps"));
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API.replace("/events", "/guests"));
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete Party";
  deleteBtn.style.marginTop = "1em";
  deleteBtn.addEventListener("click", async () => {
    try {
      await fetch(`${API}/${selectedParty.id}`, {
        method: "DELETE",
      });
      selectedParty = null;
      await getParties();
    } catch (e) {
      console.error("Failed to delete party:", e);
    }
  });

  $party.appendChild(deleteBtn);
  return $party;
}

/** A form to create a new party */
function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <h3>Add New Party</h3>
    <input name="name" placeholder="Party Name" required />
    <textarea name="description" placeholder="Description" required></textarea>
    <input type="date" name="date" required />
    <input name="location" placeholder="Location" required />
    <button type="submit">Create Party</button>
  `;

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData($form);

    const newParty = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: new Date(formData.get("date")).toISOString(),
      location: formData.get("location"),
    };

    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });
      await getParties();
      $form.reset();
    } catch (e) {
      console.error("Error creating party:", e);
    }
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <div id="party-list"></div>
        <div id="party-form"></div>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <div id="party-details"></div>
      </section>
    </main>
  `;

  document.querySelector("#party-list").replaceWith(PartyList());
  document.querySelector("#party-form").replaceWith(NewPartyForm());
  document.querySelector("#party-details").replaceWith(SelectedParty());
}

// === Init ===
async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
