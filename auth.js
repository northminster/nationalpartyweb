/**
 * National Party Westbridge: client-side accounts & permissions (demo).
 * Data lives in localStorage. Anyone with this device can inspect or edit it.
 * For production, use a real server and never trust the browser alone.
 */
(function (global) {
  var SESSION_KEY = "npw_admin_session";
  var USERS_KEY = "npw_user_registry";
  var REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

  /* Client handoff: change these before a public launch. See CLIENT_HANDOFF.md and README.md. */
  var DEFAULT_ADMIN_EMAIL = "admin@westbridge.np";
  var DEFAULT_ADMIN_PASSWORD = "WestbridgeAdmin2025!";

  /** Superuser: implies all other permissions. */
  var PERM_ADMIN = "admin";
  var PERM_MANAGE_USERS = "manage_users";
  var PERM_PUBLISH = "publish_announcements";

  var PERMISSION_CATALOG = [
    { id: PERM_ADMIN, label: "Administrator (full access)" },
    { id: PERM_MANAGE_USERS, label: "Create accounts & set permissions" },
    { id: PERM_PUBLISH, label: "Publish official announcements" },
  ];

  function loadUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function uid() {
    return "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function simpleHash(email, password) {
    var s = String(email).trim().toLowerCase() + "|" + password;
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return "fnv1a_" + h.toString(16);
  }

  function hashPassword(email, password) {
    if (!global.crypto || !global.crypto.subtle) {
      return Promise.resolve(simpleHash(email, password));
    }
    var enc = new TextEncoder();
    var msg = enc.encode(String(email).trim().toLowerCase() + "|" + password);
    return crypto.subtle.digest("SHA-256", msg).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) {
          return ("0" + b.toString(16)).slice(-2);
        })
        .join("");
    });
  }

  var ensureUsersPromise = null;

  function ensureUsers() {
    if (ensureUsersPromise) return ensureUsersPromise;
    ensureUsersPromise = (async function () {
      var users = loadUsers();
      if (users.length > 0) return;
      var hash = await hashPassword(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
      saveUsers([
        {
          id: uid(),
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash: hash,
          permissions: [PERM_ADMIN],
        },
      ]);
    })();
    return ensureUsersPromise;
  }

  function normalizePermissions(arr) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (p) {
      if (typeof p === "string" && p && out.indexOf(p) === -1) out.push(p);
    });
    if (out.indexOf(PERM_ADMIN) !== -1) return [PERM_ADMIN];
    return out;
  }

  function hasPermission(session, perm) {
    if (!session || !session.permissions) return false;
    if (session.permissions.indexOf(PERM_ADMIN) !== -1) return true;
    return session.permissions.indexOf(perm) !== -1;
  }

  function parseSessionRaw(raw) {
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      if (data.expiresAt && Date.now() > data.expiresAt) {
        clearSession();
        return null;
      }
      if (data.role === "admin" && !data.userId) {
        clearSession();
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function getSession() {
    var data =
      parseSessionRaw(sessionStorage.getItem(SESSION_KEY)) ||
      parseSessionRaw(localStorage.getItem(SESSION_KEY));
    if (!data || !data.userId) return null;
    var users = loadUsers();
    var user = users.find(function (u) {
      return u.id === data.userId;
    });
    if (!user) {
      clearSession();
      return null;
    }
    return {
      userId: user.id,
      email: user.email,
      permissions: normalizePermissions(user.permissions),
      at: data.at,
      expiresAt: data.expiresAt,
    };
  }

  function setSessionForUser(user, remember) {
    var payload = {
      userId: user.id,
      email: user.email,
      permissions: normalizePermissions(user.permissions),
      at: Date.now(),
      expiresAt: remember ? Date.now() + REMEMBER_MS : null,
    };
    var raw = JSON.stringify(payload);
    sessionStorage.setItem(SESSION_KEY, raw);
    if (remember) {
      localStorage.setItem(SESSION_KEY, raw);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  async function tryLogin(email, password, remember) {
    await ensureUsers();
    var users = loadUsers();
    var hash = await hashPassword(email, password);
    var user = users.find(function (u) {
      return u.email.toLowerCase() === String(email).trim().toLowerCase();
    });
    if (!user || user.passwordHash !== hash) return false;
    setSessionForUser(user, remember);
    return true;
  }

  function requireAnyPermission(perms, redirectUrl) {
    var s = getSession();
    if (!s) {
      window.location.replace("login.html");
      return false;
    }
    for (var i = 0; i < perms.length; i++) {
      if (hasPermission(s, perms[i])) return true;
    }
    window.location.replace(redirectUrl || "admin.html");
    return false;
  }

  async function createUser(email, password, permissions) {
    await ensureUsers();
    var s = getSession();
    if (!hasPermission(s, PERM_ADMIN) && !hasPermission(s, PERM_MANAGE_USERS)) {
      return { ok: false, error: "You don’t have permission to create accounts." };
    }
    var em = String(email).trim().toLowerCase();
    if (!em || !em.includes("@")) return { ok: false, error: "Enter a valid email." };
    if (String(password).length < 8) return { ok: false, error: "Password must be at least 8 characters." };
    var users = loadUsers();
    if (users.some(function (u) { return u.email.toLowerCase() === em; })) {
      return { ok: false, error: "That email is already registered." };
    }
    var hash = await hashPassword(em, password);
    var perms = normalizePermissions(permissions);
    users.push({
      id: uid(),
      email: em,
      passwordHash: hash,
      permissions: perms.length ? perms : [PERM_PUBLISH],
    });
    saveUsers(users);
    return { ok: true };
  }

  async function updateUserPermissions(userId, permissions) {
    await ensureUsers();
    var s = getSession();
    if (!hasPermission(s, PERM_ADMIN) && !hasPermission(s, PERM_MANAGE_USERS)) {
      return { ok: false, error: "Permission denied." };
    }
    var users = loadUsers();
    var idx = users.findIndex(function (u) {
      return u.id === userId;
    });
    if (idx === -1) return { ok: false, error: "User not found." };
    users[idx].permissions = normalizePermissions(permissions);
    if (users[idx].permissions.length === 0) {
      users[idx].permissions = [PERM_PUBLISH];
    }
    saveUsers(users);
    return { ok: true };
  }

  async function deleteUser(userId) {
    await ensureUsers();
    var s = getSession();
    if (!hasPermission(s, PERM_ADMIN) && !hasPermission(s, PERM_MANAGE_USERS)) {
      return { ok: false, error: "Permission denied." };
    }
    if (s.userId === userId) return { ok: false, error: "You can’t delete your own account." };
    var users = loadUsers();
    var admins = users.filter(function (u) {
      return normalizePermissions(u.permissions).indexOf(PERM_ADMIN) !== -1;
    });
    var target = users.find(function (u) {
      return u.id === userId;
    });
    if (!target) return { ok: false, error: "User not found." };
    if (normalizePermissions(target.permissions).indexOf(PERM_ADMIN) !== -1 && admins.length <= 1) {
      return { ok: false, error: "Can’t remove the last administrator." };
    }
    users = users.filter(function (u) {
      return u.id !== userId;
    });
    saveUsers(users);
    return { ok: true };
  }

  function listUsers() {
    return loadUsers().map(function (u) {
      return {
        id: u.id,
        email: u.email,
        permissions: normalizePermissions(u.permissions),
      };
    });
  }

  global.NPWAuth = {
    SESSION_KEY: SESSION_KEY,
    USERS_KEY: USERS_KEY,
    PERM_ADMIN: PERM_ADMIN,
    PERM_MANAGE_USERS: PERM_MANAGE_USERS,
    PERM_PUBLISH: PERM_PUBLISH,
    PERMISSION_CATALOG: PERMISSION_CATALOG,
    ensureUsers: ensureUsers,
    hashPassword: hashPassword,
    getSession: getSession,
    clearSession: clearSession,
    tryLogin: tryLogin,
    hasPermission: hasPermission,
    can: function (perm) {
      return hasPermission(getSession(), perm);
    },
    requireAuth: function (loginUrl) {
      if (!getSession()) {
        window.location.replace(loginUrl || "login.html");
        return false;
      }
      return true;
    },
    requireAnyPermission: requireAnyPermission,
    redirectIfAuthed: function (to) {
      if (getSession()) {
        window.location.replace(to || "admin.html");
        return true;
      }
      return false;
    },
    listUsers: listUsers,
    createUser: createUser,
    updateUserPermissions: updateUserPermissions,
    deleteUser: deleteUser,
    normalizePermissions: normalizePermissions,
  };
})(typeof window !== "undefined" ? window : this);
