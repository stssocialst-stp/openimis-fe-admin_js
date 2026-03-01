import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  formatMessage,
  clearCurrentPaginationPage,
} from "@stssocialst-stp/fe-core";
import { RIGHT_USER_ADD, MODULE_NAME } from "../constants";
import UserSearcher from "../components/UserSearcher";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class UsersPage extends Component {
  onDoubleClick = (u, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "admin.userOverview", [u.id], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "admin.userNew");
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { classes, rights, intl } = this.props;
    return (
      <div className={classes.page}>
        <UserSearcher cacheFiltersKey="usersPageFiltersCache" onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_USER_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "admin.user", "addNewUser.tooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(UsersPage)))),
  ),
);
