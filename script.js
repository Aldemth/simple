const checklistItems = [
  {
    item: 'Emergency flashlight',
    category: 'Emergency Kit',
    description: 'Keep a working flashlight available.'
  },
  {
    item: 'Emergency water supply',
    category: 'Emergency Kit',
    description: 'Prepare an appropriate emergency water supply.'
  },
  {
    item: 'Household emergency contacts',
    category: 'Family Preparedness',
    description: 'Write down important phone numbers and choose an out-of-area contact.'
  },
  {
    item: 'Important documents',
    category: 'Family Preparedness',
    description: 'Keep copies of identification, medical details, and key documents in a waterproof pouch.'
  },
  {
    item: 'Evacuation route and meeting place',
    category: 'Family Preparedness',
    description: 'Find your barangay evacuation center, agree on a safe route, and choose a meeting place.'
  },
  {
    item: 'Household support plan',
    category: 'Family Preparedness',
    description: 'Plan how to help children, older adults, people with disabilities, and pets.'
  }
];

const checklist = document.querySelector('#checklist');
const progressCount = document.querySelector('#progress-count');
const progressFill = document.querySelector('#progress-fill');
const progressTrack = document.querySelector('#progress-track');
const profileButton = document.querySelector('#profile-button');
const profileButtonLabel = document.querySelector('#profile-button-label');
const profileDialog = document.querySelector('#profile-dialog');
const profileForm = document.querySelector('#profile-form');
const profileName = document.querySelector('#profile-name');
const profileBarangay = document.querySelector('#profile-barangay');
const profileStatus = document.querySelector('#profile-status');
const profileSave = document.querySelector('#profile-save');
const profileRemove = document.querySelector('#profile-remove');
const profileClose = document.querySelector('#profile-close');

let profile = null;

function renderChecklist() {
  const groups = new Map();

  checklistItems.forEach((entry, index) => {
    if (!groups.has(entry.category)) {
      groups.set(entry.category, []);
    }
    groups.get(entry.category).push({ ...entry, index });
  });

  groups.forEach((entries, category) => {
    const group = document.createElement('section');
    group.className = 'check-group';

    const heading = document.createElement('h4');
    heading.className = 'check-category';
    heading.textContent = category;
    group.append(heading);

    entries.forEach((entry) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'check-entry';

      const label = document.createElement('label');
      label.className = 'check-item';
      label.htmlFor = `check-${entry.index}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `check-${entry.index}`;
      checkbox.name = `check-${entry.index}`;
      checkbox.addEventListener('change', updateProgress);

      const copy = document.createElement('span');
      copy.className = 'check-copy';

      const title = document.createElement('span');
      title.className = 'check-title';
      title.textContent = entry.item;

      const description = document.createElement('span');
      description.className = 'check-description';
      description.textContent = entry.description;

      copy.append(title, description);
      label.append(checkbox, copy);
      wrapper.append(label);
      group.append(wrapper);
    });

    checklist.append(group);
  });
}

function updateProgress() {
  const checkboxes = [...checklist.querySelectorAll('input[type="checkbox"]')];
  const checked = checkboxes.filter((checkbox) => checkbox.checked).length;
  progressCount.textContent = `${checked} / ${checkboxes.length}`;
  progressFill.style.width = `${(checked / checkboxes.length) * 100}%`;
  progressTrack.setAttribute('aria-valuenow', String(checked));
}

function updateProfileButton() {
  profileButtonLabel.textContent = profile ? profile.name : 'Profile';
  profileButton.setAttribute(
    'aria-label',
    profile ? `Open profile for ${profile.name}` : 'Open household profile'
  );
  profileRemove.hidden = !profile;
  profileSave.textContent = profile ? 'Update local profile' : 'Save local profile';
}

function loadProfile() {
  try {
    const savedProfile = localStorage.getItem('readyTogetherProfile');
    profile = savedProfile ? JSON.parse(savedProfile) : null;
    if (profile && (typeof profile.name !== 'string' || typeof profile.barangay !== 'string')) {
      throw new Error('Saved profile has an invalid format.');
    }
  } catch (error) {
    profile = null;
    profileStatus.textContent = 'The saved profile could not be read. You can create a new local profile.';
    console.error('Unable to load the local profile:', error);
  }

  if (profile) {
    profileName.value = profile.name;
    profileBarangay.value = profile.barangay;
  }
  updateProfileButton();
}

function openProfile() {
  profileStatus.textContent = '';
  if (typeof profileDialog.showModal === 'function') {
    profileDialog.showModal();
    profileName.focus();
  } else {
    profileStatus.textContent = 'Your browser does not support the profile dialog.';
  }
}

renderChecklist();
updateProgress();
loadProfile();

profileButton.addEventListener('click', openProfile);
profileClose.addEventListener('click', () => profileDialog.close());

profileDialog.addEventListener('click', (event) => {
  if (event.target === profileDialog) {
    profileDialog.close();
  }
});

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nextProfile = {
    name: profileName.value.trim(),
    barangay: profileBarangay.value.trim()
  };

  if (!nextProfile.name || !nextProfile.barangay) {
    profileStatus.textContent = 'Enter both your name and barangay or community.';
    return;
  }

  try {
    localStorage.setItem('readyTogetherProfile', JSON.stringify(nextProfile));
    profile = nextProfile;
    profileStatus.textContent = 'Your local profile is saved on this device.';
    updateProfileButton();
  } catch (error) {
    profileStatus.textContent = 'Your browser could not save this profile. Check its storage settings and try again.';
    console.error('Unable to save the local profile:', error);
  }
});

profileRemove.addEventListener('click', () => {
  try {
    localStorage.removeItem('readyTogetherProfile');
    profile = null;
    profileForm.reset();
    profileStatus.textContent = 'Your saved local profile was removed from this device.';
    updateProfileButton();
  } catch (error) {
    profileStatus.textContent = 'Your profile could not be removed. Check your browser storage settings and try again.';
    console.error('Unable to remove the local profile:', error);
  }
});