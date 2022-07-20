import Alpine from 'alpinejs';
import {v4 as uuid} from 'uuid';

Alpine.data('checklist', () => ({
  selectOpen: false,
  edit: false,
  checklist: null,
  checklists: null,
  displayExportImport: false,
  json: null,

  init() {
    const state = localStorage.getItem('checklists');

    if (state) {
      const data = JSON.parse(state);
      this.checklists = data.checklists;
      this.checklist = data.checklist;
    } else {
      this.checklists = {};
      this.addChecklist();
    }

    Alpine.effect(() => {
      localStorage.setItem('checklists', JSON.stringify({
        checklists: this.checklists,
        checklist: this.checklist
      }));
    });
  },

  items() {
    return this.checklists[this.checklist].items;
  },

  progress() {
    const items = this.items();

    return Math.round(items.filter(i => i[0]).length / items.length * 100);
  },

  move(index, dir) {
    const items = this.items();

    if (dir === 'up' && index > 0) {
      items.splice(index - 1, 0, items.splice(index, 1)[0]);
    } else if (dir === 'down' && index < items.length - 1) {
      items.splice(index + 1, 0, items.splice(index, 1)[0]);
    }
  },

  remove(index) {
    if (!confirm('Are you sure you want to remove the item?')) {
      return;
    }

    const items = this.items();

    items.splice(index, 1);

    if (items.length === 0) {
      this.add();
    }
  },

  add() {
    const items = this.items();

    items.push([false, 'New Item', 'Add a description here...']);
  },

  resetChecklist() {
    if (!confirm('Are you sure you want to reset the checklist?')) {
      return;
    }

    const items = this.items();

    items.forEach(i => i[0] = false);
  },

  addChecklist() {
    const id = uuid();

    this.checklists[id] = {
      title: 'New Checklist',
      desc: 'Add a description here...',
      items: [],
    };

    this.checklist = id;

    this.add();
    this.edit = true;
  },

  removeChecklist() {
    if (!confirm('Are you sure you want to delete this checklist?')) {
      return;
    }

    delete this.checklists[this.checklist];

    if (Object.keys(this.checklists).length) {
      this.checklist = Object.keys(this.checklists)[0];
    } else {
      this.addChecklist();
    }
  },

  toggleExportImport() {
    this.displayExportImport = !this.displayExportImport;

    if (this.displayExportImport) {
      this.json = JSON.stringify(this.checklists, null, 2);
    }
  },

  downloadJson() {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(this.json)}`;
    const el = document.createElement('a');
    el.setAttribute('href', data);
    el.setAttribute('download', 'checklist-export.json');
    document.body.appendChild(el);
    el.click();
    el.remove();
  },

  importJson() {
    if (!confirm('Are you sure you want to import these checklists? This will overwrite your current checklists.')) {
      return;
    }

    try {
      const data = JSON.parse(this.json);
      
      this.checklists = data;
      this.checklist = Object.keys(this.checklists)[0];

      this.edit = false;
      this.displayExportImport = false;

      alert('Checklists imported successfully!');
    } catch (e) {
      alert('Invalid JSON');
    }
  }
}));

Alpine.start();
