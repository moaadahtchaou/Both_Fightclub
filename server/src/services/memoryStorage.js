class MemoryStorage {
  constructor() {
    this.users = [];
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
    global.memoryUsers = this.users;
    global.isUsingMemoryStorage = true;
  }

  addUser(user) {
    this.users.push(user);
    global.memoryUsers = this.users;
  }

  getUsers() {
    return this.users;
  }

  findUser(query) {
    return this.users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  }

  isUsingMemory() {
    return this.isActive;
  }
}

module.exports = new MemoryStorage();