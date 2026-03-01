import { decodeId } from "@stssocialst-stp/fe-core";
import { fetchSubstitutionEnrolmentOfficers } from "./actions";
import {
  CLAIM_ADMIN_USER_TYPE,
  INTERACTIVE_USER_TYPE,
  ENROLMENT_OFFICER_USER_TYPE,
  CLAIM_ADMIN_IS_SYSTEM,
  OFFICER_ROLE_IS_SYSTEM,
} from "./constants";

const addUserType = (user, userType) => {
  if (!user.userTypes.includes(userType)) {
    user.userTypes = [...user.userTypes, userType];
  }
};

export function checkRolesAndGetUserTypes(user) {
  if (!user) return console.warn("User not provided in checkRolesAndGetUserTypes function!");

  const tempUser = user;
  const initialUserTypes = [INTERACTIVE_USER_TYPE];

  if (!tempUser.roles) {
    tempUser.userTypes = initialUserTypes;
  }

  if (tempUser.roles?.some((role) => role.isSystem === CLAIM_ADMIN_IS_SYSTEM)) {
    addUserType(tempUser, CLAIM_ADMIN_USER_TYPE);
  }

  if (tempUser.roles?.some((role) => role.isSystem === OFFICER_ROLE_IS_SYSTEM)) {
    addUserType(tempUser, ENROLMENT_OFFICER_USER_TYPE);
  }
  return tempUser.userTypes;
}

export const mapQueriesUserToStore = (u) => {
  // TODO: make this more generic
  u.hasLogin = false;
  u.userTypes = checkRolesAndGetUserTypes(u);
  if (u.iUser) {
    u.hasLogin = true;
    u.lastName = u.iUser.lastName;
    u.otherNames = u.iUser.otherNames;
    u.email = u.iUser.email;
    u.phoneNumber = u.iUser.phone;
    u.healthFacility = u.iUser.healthFacility;
    u.language = u.iUser.languageId;
    u.roles = u.iUser.roles;
    u.districts = u.iUser.districts.map((d) => d.location);
  }
  if (u.claimAdmin) {
    u.hasLogin = u.hasLogin || u.claimAdmin.hasLogin;
    u.lastName = u.claimAdmin.lastName;
    u.otherNames = u.claimAdmin.otherNames;
    u.email = u.email ?? u.claimAdmin.emailId;
    u.phoneNumber = u.claimAdmin.phone;
    u.birthDate = u.claimAdmin.dob;
    u.healthFacility = u.claimAdmin.healthFacility;
  }
  if (u.officer) {
    u.hasLogin = u.hasLogin || u.officer.hasLogin;
    u.lastName = u.officer.lastName;
    u.otherNames = u.officer.otherNames;
    u.email = u.email ?? u.officer.email;
    u.phoneNumber = u.officer.phone;
    u.birthDate = u.officer.dob;
    u.address = u.officer.address;
    u.substitutionOfficer = u.officer.substitutionOfficer;
    // substitutionOfficer is user.officer so it cannot be retrieved using the UserPicker
    u.worksTo = u.officer.worksTo;
    u.location = u.officer.location;
    u.officerVillages = u.officer.officerVillages.map((x) => x.location);
  }
  return u;
};

export const mapUserValuesToInput = (values) => {
  const input = {
    uuid: values.id ? decodeId(values.id) : null,
    username: values.username,
    userTypes: values.userTypes,
    lastName: values.lastName,
    otherNames: values.otherNames,
    phone: values.phoneNumber,
    email: values.email,
    password: values.password,
    healthFacilityId: values.healthFacility ? decodeId(values.healthFacility.id) : null,
    districts: values.districts.map((d) => decodeId(d.id)),
    locationId: values.location ? decodeId(values.location.id) : null,
    language: values.language,
    roles: values.roles.map((r) => decodeId(r.id)),
    birthDate: values.birthDate,
    address: values.address,
    substitutionOfficerId: values.substitutionOfficer?.id ? decodeId(values.substitutionOfficer.id) : null,
    worksTo: values.worksTo,
    villageIds: values.officerVillages?.map((location) => decodeId(location.id)),
  };
  return input;
};

export const toggleUserType = (user, type) => {
  if (!user.userTypes) {
    user.userTypes = [];
  }

  if (user.userTypes.includes(type)) {
    user.userTypes = user.userTypes.filter((x) => x !== type);
  } else {
    user.userTypes.push(type);
  }

  return user;
};

export const toggleUserRoles = (edited, data, isValid, isEnabled, hasRole, onEditedChanged, roleIsSystem) => {
  const roles = edited?.roles ?? [];
  const role = data?.role.edges?.[0].node;

  if (isValid && isEnabled && !hasRole) {
    roles.push(role);
    edited.roles = roles;
    onEditedChanged({ ...edited });
  } else if (isValid && !isEnabled) {
    const filteredRoles = roles.filter((tempRole) => tempRole.isSystem !== roleIsSystem);
    edited.roles = filteredRoles;
    onEditedChanged({ ...edited });
  }
};

export const toggleSwitchButton = (edited, hasRole, hasUserType, setIsEnabled, onEditedChanged, userType) => {
  if (hasRole) {
    setIsEnabled(() => true);
    onEditedChanged(toggleUserType(edited, userType));
  } else {
    setIsEnabled(() => false);
    if (hasUserType) {
      onEditedChanged(toggleUserType(edited, userType));
    }
  }
};

export const fetchSubstitutionEOs = (dispatch, mm, officerUuid, searchString, villages) => {
  dispatch(
    fetchSubstitutionEnrolmentOfficers(mm, {
      officerUuid,
      first: searchString ? undefined : 15,
      villagesUuids: villages?.map((village) => village.uuid),
      str: searchString,
    }),
  );
};
