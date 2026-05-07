import React, { useState, useEffect, useCallback } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  Collapse,
} from "@material-ui/core";
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { formatMessage, withModulesManager, Helmet, decodeId } from "@stssocialst-stp/fe-core";

import {
  fetchPermissoesDisponiveis,
  fetchPermissoesDoRole,
  fetchAllRoles,
  fetchAllUsers,
  fetchRolesDoUtilizador,
  adicionarPermissaoAoRole,
  removerPermissaoDoRole,
  atribuirRoleAoUtilizador,
  removerRoleDoUtilizador,
} from "../actions";

const styles = (theme) => ({
  page: theme.page,
  paper: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
  tabs: {
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  headerIcon: {
    color: theme.palette.primary.main,
    fontSize: 28,
  },
  roleList: {
    maxHeight: 400,
    overflow: "auto",
  },
  selectedRole: {
    backgroundColor: theme.palette.action.selected,
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },
  moduleGroup: {
    marginBottom: theme.spacing(1),
  },
  moduleHeader: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: 4,
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
    },
  },
  moduleTitle: {
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    color: theme.palette.text.secondary,
    flex: 1,
  },
  permCount: {
    fontSize: "0.7rem",
    color: theme.palette.text.hint,
    marginRight: theme.spacing(1),
  },
  permRow: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  rightIdChip: {
    fontSize: "0.7rem",
    height: 20,
  },
  splitPane: {
    display: "flex",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  leftPane: {
    flex: "0 0 280px",
    [theme.breakpoints.down("sm")]: {
      flex: "1",
    },
  },
  rightPane: {
    flex: 1,
    minWidth: 0,
  },
  userRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedUserRow: {
    backgroundColor: theme.palette.action.selected,
  },
  searchField: {
    marginBottom: theme.spacing(1),
  },
  chipActive: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    margin: theme.spacing(0.5),
  },
  chipRole: {
    margin: theme.spacing(0.5),
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "4px 4px 0 0",
  },
});

function TabPanel({ children, value, index }) {
  return value === index ? <div>{children}</div> : null;
}

// ─── Tab 1: Roles & Permissions ───

function RolesPermissionsTab({ classes, intl }) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(null); // rightId currently being toggled
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [expandedModules, setExpandedModules] = useState({});
  const [searchRole, setSearchRole] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [r, p] = await Promise.all([fetchAllRoles(), fetchPermissoesDisponiveis()]);
        setRoles(r);
        setAllPermissions(p);
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadRolePerms = useCallback(async (roleId) => {
    setLoadingPerms(true);
    try {
      const perms = await fetchPermissoesDoRole(roleId);
      setRolePermissions(perms);
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  const handleSelectRole = useCallback(
    (role) => {
      const id = decodeId(role.id);
      setSelectedRole({ ...role, decodedId: id });
      loadRolePerms(id);
      // Expand all modules by default
      const modules = {};
      allPermissions.forEach((p) => {
        modules[p.modulo] = true;
      });
      setExpandedModules(modules);
    },
    [loadRolePerms, allPermissions],
  );

  const handleTogglePerm = useCallback(
    async (rightId, isActive) => {
      if (!selectedRole) return;
      setSaving(rightId);
      try {
        const result = isActive
          ? await removerPermissaoDoRole(selectedRole.decodedId, rightId)
          : await adicionarPermissaoAoRole(selectedRole.decodedId, rightId);
        if (result.ok) {
          await loadRolePerms(selectedRole.decodedId);
          setSnack({
            open: true,
            message: isActive
              ? formatMessage(intl, "admin", "rolePerms.permRemoved")
              : formatMessage(intl, "admin", "rolePerms.permAdded"),
            severity: "success",
          });
        } else {
          setSnack({ open: true, message: (result.errors || []).join(", "), severity: "error" });
        }
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      } finally {
        setSaving(null);
      }
    },
    [selectedRole, loadRolePerms, intl],
  );

  const toggleModule = (mod) => {
    setExpandedModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  // Group permissions by module
  const grouped = {};
  allPermissions.forEach((p) => {
    if (!grouped[p.modulo]) grouped[p.modulo] = [];
    grouped[p.modulo].push(p);
  });

  const activeRightIds = new Set(rolePermissions.map((rp) => rp.rightId));

  const filteredRoles = roles.filter(
    (r) => !searchRole || r.name.toLowerCase().includes(searchRole.toLowerCase()),
  );

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.splitPane}>
      {/* Left: Role list */}
      <Paper className={classes.leftPane} variant="outlined">
        <div className={classes.summaryBar}>
          <Typography variant="subtitle2">
            {formatMessage(intl, "admin", "rolePerms.roles")} ({roles.length})
          </Typography>
        </div>
        <div style={{ padding: 8 }}>
          <TextField
            size="small"
            variant="outlined"
            fullWidth
            placeholder={formatMessage(intl, "admin", "rolePerms.searchRole")}
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <List dense className={classes.roleList}>
            {filteredRoles.map((role) => (
              <ListItem
                key={role.id}
                button
                onClick={() => handleSelectRole(role)}
                className={selectedRole?.id === role.id ? classes.selectedRole : ""}
              >
                <ListItemText primary={role.name} secondary={role.isSystem ? "System" : ""} />
              </ListItem>
            ))}
            {filteredRoles.length === 0 && (
              <Typography className={classes.emptyState} variant="body2">
                {formatMessage(intl, "admin", "rolePerms.noRoles")}
              </Typography>
            )}
          </List>
        </div>
      </Paper>

      {/* Right: Permissions */}
      <Paper className={classes.rightPane} variant="outlined">
        <div className={classes.summaryBar}>
          <Typography variant="subtitle2">
            {selectedRole
              ? `${formatMessage(intl, "admin", "rolePerms.permissionsOf")} "${selectedRole.name}"`
              : formatMessage(intl, "admin", "rolePerms.selectRole")}
          </Typography>
          {selectedRole && (
            <Chip
              size="small"
              label={`${activeRightIds.size} / ${allPermissions.length}`}
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
            />
          )}
        </div>

        {!selectedRole && (
          <Typography className={classes.emptyState} variant="body2">
            {formatMessage(intl, "admin", "rolePerms.selectRoleHint")}
          </Typography>
        )}

        {selectedRole && loadingPerms && (
          <div className={classes.loader}>
            <CircularProgress size={24} />
          </div>
        )}

        {selectedRole && !loadingPerms && (
          <div style={{ padding: 8 }}>
            {Object.keys(grouped)
              .sort()
              .map((mod) => {
                const perms = grouped[mod];
                const activeInModule = perms.filter((p) => activeRightIds.has(p.rightId)).length;
                return (
                  <div key={mod} className={classes.moduleGroup}>
                    <div className={classes.moduleHeader} onClick={() => toggleModule(mod)}>
                      <Typography className={classes.moduleTitle}>{mod}</Typography>
                      <span className={classes.permCount}>
                        {activeInModule}/{perms.length}
                      </span>
                      {expandedModules[mod] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </div>
                    <Collapse in={!!expandedModules[mod]}>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {perms.map((perm) => {
                              const isActive = activeRightIds.has(perm.rightId);
                              const isSaving = saving === perm.rightId;
                              return (
                                <TableRow key={perm.rightId} className={classes.permRow}>
                                  <TableCell padding="checkbox" style={{ width: 48 }}>
                                    {isSaving ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <Checkbox
                                        checked={isActive}
                                        color="primary"
                                        onChange={() => handleTogglePerm(perm.rightId, isActive)}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">{perm.nome}</Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={perm.rightId}
                                      size="small"
                                      variant="outlined"
                                      className={classes.rightIdChip}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Collapse>
                  </div>
                );
              })}
          </div>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// ─── Tab 2: User Roles ───

function UserRolesTab({ classes, intl }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [u, r] = await Promise.all([fetchAllUsers(), fetchAllRoles()]);
        setUsers(u);
        setRoles(r);
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadUserRoles = useCallback(async (iUserId) => {
    setLoadingRoles(true);
    try {
      const ur = await fetchRolesDoUtilizador(iUserId);
      setUserRoles(ur);
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const handleSelectUser = useCallback(
    (user) => {
      const iUserId = user.iUser?.id;
      if (!iUserId) {
        setSnack({
          open: true,
          message: formatMessage(intl, "admin", "rolePerms.noIUser"),
          severity: "warning",
        });
        return;
      }
      const decodedIUserId = decodeId(iUserId);
      setSelectedUser({ ...user, decodedIUserId });
      loadUserRoles(decodedIUserId);
    },
    [loadUserRoles, intl],
  );

  const handleRemoveRole = useCallback(
    async (roleId) => {
      if (!selectedUser) return;
      setActionInProgress(roleId);
      try {
        const result = await removerRoleDoUtilizador(selectedUser.decodedIUserId, roleId);
        if (result.ok) {
          await loadUserRoles(selectedUser.decodedIUserId);
          setSnack({
            open: true,
            message: formatMessage(intl, "admin", "rolePerms.roleRemoved"),
            severity: "success",
          });
        } else {
          setSnack({ open: true, message: (result.errors || []).join(", "), severity: "error" });
        }
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      } finally {
        setActionInProgress(null);
      }
    },
    [selectedUser, loadUserRoles, intl],
  );

  const handleAddRole = useCallback(
    async (roleId) => {
      if (!selectedUser) return;
      setActionInProgress(roleId);
      try {
        const decodedRoleId = decodeId(roleId);
        const result = await atribuirRoleAoUtilizador(selectedUser.decodedIUserId, decodedRoleId);
        if (result.ok) {
          await loadUserRoles(selectedUser.decodedIUserId);
          setAddDialogOpen(false);
          setSnack({
            open: true,
            message: formatMessage(intl, "admin", "rolePerms.roleAdded"),
            severity: "success",
          });
        } else {
          setSnack({ open: true, message: (result.errors || []).join(", "), severity: "error" });
        }
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      } finally {
        setActionInProgress(null);
      }
    },
    [selectedUser, loadUserRoles, intl],
  );

  const getUserDisplayName = (user) => {
    if (user.iUser) {
      const parts = [user.iUser.otherNames, user.iUser.lastName].filter(Boolean);
      return parts.length > 0 ? `${parts.join(" ")} (${user.username})` : user.username;
    }
    return user.username;
  };

  const filteredUsers = users.filter(
    (u) =>
      !searchUser ||
      getUserDisplayName(u).toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase()),
  );

  // Roles not yet assigned to this user
  const userRoleIds = new Set(userRoles.map((ur) => ur.id));
  const availableRoles = roles.filter((r) => !userRoleIds.has(r.id) && !userRoleIds.has(decodeId(r.id)));

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.splitPane}>
      {/* Left: User list */}
      <Paper className={classes.leftPane} variant="outlined">
        <div className={classes.summaryBar}>
          <Typography variant="subtitle2">
            {formatMessage(intl, "admin", "rolePerms.users")} ({users.length})
          </Typography>
        </div>
        <div style={{ padding: 8 }}>
          <TextField
            size="small"
            variant="outlined"
            fullWidth
            placeholder={formatMessage(intl, "admin", "rolePerms.searchUser")}
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <List dense className={classes.roleList}>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleSelectUser(user)}
                className={selectedUser?.id === user.id ? classes.selectedRole : ""}
              >
                <ListItemText
                  primary={getUserDisplayName(user)}
                  secondary={user.iUser ? `iUser ID: ${decodeId(user.iUser.id)}` : "No iUser"}
                />
              </ListItem>
            ))}
            {filteredUsers.length === 0 && (
              <Typography className={classes.emptyState} variant="body2">
                {formatMessage(intl, "admin", "rolePerms.noUsers")}
              </Typography>
            )}
          </List>
        </div>
      </Paper>

      {/* Right: User roles */}
      <Paper className={classes.rightPane} variant="outlined">
        <div className={classes.summaryBar}>
          <Typography variant="subtitle2">
            {selectedUser
              ? `${formatMessage(intl, "admin", "rolePerms.rolesOf")} "${selectedUser.username}"`
              : formatMessage(intl, "admin", "rolePerms.selectUser")}
          </Typography>
          {selectedUser && (
            <Tooltip title={formatMessage(intl, "admin", "rolePerms.addRole")}>
              <IconButton size="small" style={{ color: "#fff" }} onClick={() => setAddDialogOpen(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>

        {!selectedUser && (
          <Typography className={classes.emptyState} variant="body2">
            {formatMessage(intl, "admin", "rolePerms.selectUserHint")}
          </Typography>
        )}

        {selectedUser && loadingRoles && (
          <div className={classes.loader}>
            <CircularProgress size={24} />
          </div>
        )}

        {selectedUser && !loadingRoles && (
          <div style={{ padding: 8 }}>
            {userRoles.length === 0 ? (
              <Typography className={classes.emptyState} variant="body2">
                {formatMessage(intl, "admin", "rolePerms.noUserRoles")}
              </Typography>
            ) : (
              <List>
                {userRoles.map((ur) => (
                  <ListItem key={ur.id} divider>
                    <ListItemText
                      primary={ur.nome}
                      secondary={`ID: ${ur.id}`}
                    />
                    <ListItemSecondaryAction>
                      {actionInProgress === ur.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Tooltip title={formatMessage(intl, "admin", "rolePerms.removeRole")}>
                          <IconButton edge="end" onClick={() => handleRemoveRole(ur.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </div>
        )}
      </Paper>

      {/* Add Role Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formatMessage(intl, "admin", "rolePerms.addRoleTitle")}</DialogTitle>
        <DialogContent dividers>
          {availableRoles.length === 0 ? (
            <Typography variant="body2">{formatMessage(intl, "admin", "rolePerms.allRolesAssigned")}</Typography>
          ) : (
            <List>
              {availableRoles.map((role) => (
                <ListItem key={role.id} button onClick={() => handleAddRole(role.id)}>
                  <ListItemText primary={role.name} />
                  {actionInProgress === role.id && <CircularProgress size={20} />}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {formatMessage(intl, "admin", "rolePerms.cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// ─── Main Page ───

function RolePermissionsPage(props) {
  const { classes, intl } = props;
  const [tab, setTab] = useState(0);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, "admin", "rolePerms.pageTitle")} />

      <Paper className={classes.paper}>
        <div className={classes.header}>
          <SecurityIcon className={classes.headerIcon} />
          <Typography variant="h5">{formatMessage(intl, "admin", "rolePerms.pageTitle")}</Typography>
        </div>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
        >
          <Tab label={formatMessage(intl, "admin", "rolePerms.tab.rolesPermissions")} />
          <Tab label={formatMessage(intl, "admin", "rolePerms.tab.userRoles")} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <RolesPermissionsTab classes={classes} intl={intl} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <UserRolesTab classes={classes} intl={intl} />
        </TabPanel>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
});

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(RolePermissionsPage)))),
);
