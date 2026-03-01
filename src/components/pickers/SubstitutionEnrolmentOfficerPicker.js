import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { TextField } from "@material-ui/core";

import { withModulesManager, Autocomplete, useTranslations } from "@stssocialst-stp/fe-core";
import { fetchSubstitutionEOs } from "../../utils";
import { DEFAULT } from "../../constants";

const SubstitutionEnrolmentOfficerPicker = (props) => {
  const {
    onChange,
    modulesManager,
    readOnly = false,
    required = false,
    value,
    villages,
    filterOptions,
    filterSelectedOptions,
    multiple = false,
    withLabel = true,
    label,
    withPlaceholder = false,
    placeholder,
  } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations("admin", modulesManager);
  const [searchString, setSearchString] = useState("");
  const { isFetching, items } = useSelector((state) => state.admin.substitutionEnrolmentOfficers);
  const officerUuid = useSelector((state) => state.admin?.user?.officer?.uuid) ?? null;

  const handleInputChange = (str) => {
    setSearchString(str);
    fetchSubstitutionEOs(dispatch, modulesManager, officerUuid, searchString, villages);
  };

  const formatSuggestion = (p) => {
    const renderLastNameFirst = modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );

    if (!p) return "?";
    return [
      p.username,
      renderLastNameFirst ? p.lastName : p.otherNames,
      !renderLastNameFirst ? p.lastName : p.otherNames,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder}
      label={label}
      withLabel={withLabel}
      readOnly={readOnly}
      options={items}
      isLoading={isFetching}
      value={value}
      getOptionLabel={formatSuggestion}
      onChange={onChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={handleInputChange}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          label={withLabel && (label || formatMessage("EnrolmentOfficerFormPanel.substitutionOfficer"))}
          placeholder={
            withPlaceholder &&
            (placeholder || formatMessage("EnrolmentOfficerFormPanel.substitutionOfficer.placeholder"))
          }
        />
      )}
    />
  );
};

export default withModulesManager(SubstitutionEnrolmentOfficerPicker);
