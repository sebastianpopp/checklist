import Alpine from 'alpinejs';
import {v4 as uuid} from 'uuid';

Alpine.data('checklist', () => ({
  selectOpen: false,
  edit: false,
  checklist: null,
  checklists: null,

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
}));

Alpine.start();
