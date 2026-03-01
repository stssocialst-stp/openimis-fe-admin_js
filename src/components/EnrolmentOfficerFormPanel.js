import React, { useState, useEffect } from "react";

import { Grid, Typography, Paper, Switch } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  useTranslations,
  withModulesManager,
  combine,
  PublishedComponent,
  TextInput,
  useGraphqlQuery,
} from "@stssocialst-stp/fe-core";
import { ENROLMENT_OFFICER_USER_TYPE, OFFICER_ROLE_IS_SYSTEM } from "../constants";
import { toggleUserRoles, toggleSwitchButton } from "../utils";
import EnrolmentVillagesPicker from "./EnrolmentVillagesPicker";

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  title: theme.paper.title,
});

const EnrolmentOfficerFormPanel = (props) => {
  const { edited, classes, modulesManager, onEditedChanged, readOnly } = props;
  const { formatMessage } = useTranslations("admin.EnrolmentOfficerFormPanel", modulesManager);
  const [isEnabled, setIsEnabled] = useState(false);
  const hasOfficerUserType = edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE);
  const hasOfficerRole = edited.roles
    ? edited.roles.filter((x) => x.isSystem === OFFICER_ROLE_IS_SYSTEM).length !== 0
    : false;

  const {
    isLoading,
    data,
    error: graphqlError,
  } = useGraphqlQuery(
    `
      query UserRolesPicker ($system_id: Int) {
        role(systemRoleId: $system_id) {
          edges {
            node {
              id name isSystem
            }
          }
        }
      }
    `,
    { system_id: OFFICER_ROLE_IS_SYSTEM },
  );

  const isValid = !isLoading;
  useEffect(() => {
    toggleUserRoles(edited, data, isValid, isEnabled, hasOfficerRole, onEditedChanged, OFFICER_ROLE_IS_SYSTEM);
  }, [isEnabled]);

  useEffect(() => {
    toggleSwitchButton(
      edited,
      hasOfficerRole,
      hasOfficerUserType,
      setIsEnabled,
      onEditedChanged,
      ENROLMENT_OFFICER_USER_TYPE,
    );
  }, [hasOfficerRole]);

  return (
    <Paper className={classes.paper}>
      <Grid item xs={12} className={classes.title}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{formatMessage("title")}</Typography>
          {(edited || !isEnabled) && (
            <Switch
              color="secondary"
              disabled={readOnly}
              checked={isEnabled}
              onChange={() => setIsEnabled(() => !isEnabled)}
            />
          )}
        </Grid>
      </Grid>
      {isEnabled && (
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={4} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited?.birthDate}
                module="admin"
                label="user.dob"
                readOnly={readOnly}
                maxDate={new Date()}
                onChange={(birthDate) => onEditedChanged({ ...edited, birthDate })}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <PublishedComponent
                pubRef="admin.SubstitutionEnrolmentOfficerPicker"
                module="admin"
                readOnly={readOnly}
                withLabel
                withPlaceholder
                value={edited.substitutionOfficer}
                villages={edited.officerVillages}
                onChange={(substitutionOfficer) => onEditedChanged({ ...edited, substitutionOfficer })}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={edited?.worksTo ?? ""}
                module="admin"
                label="user.worksTo"
                readOnly={readOnly}
                onChange={(worksTo) => onEditedChanged({ ...edited, worksTo })}
              />
            </Grid>
            <Grid item xs={12} className={classes.item}>
              <TextInput
                module="admin"
                label="user.address"
                multiline
                rows={2}
                variant="outlined"
                readOnly={readOnly}
                value={edited?.address ?? ""}
                onChange={(address) => onEditedChanged({ ...edited, address })}
              />
            </Grid>
            <Grid item xs={12} className={classes.item}>
              <EnrolmentVillagesPicker
                isOfficerPanelEnabled={isEnabled}
                readOnly={readOnly}
                districts={edited.districts}
                villages={edited.officerVillages}
                onChange={(officerVillages) => onEditedChanged({ ...edited, officerVillages })}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

const enhance = combine(withModulesManager, withTheme, withStyles(styles));

export default enhance(EnrolmentOfficerFormPanel);
