import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { withModulesManager, useDebounceCb, useTranslations } from "@stssocialst-stp/fe-core";
import { fetchUsers } from "../../actions";
import { DEFAULT } from "../../constants";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

const UserPicker = (props) => {
  const {
    onChange,
    modulesManager,
    readOnly = false,
    required = false,
    withLabel = true,
    healthFacility,
    filters = [],
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple = false,
  } = props;
  const minCharLookup = modulesManager.getConf("fe-admin", "usersMinCharLookup", 2);
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("admin.UserPicker", modulesManager);
  const [open, setOpen] = useState(false);
  const users = useSelector((state) => state.admin.users.items);
  const isLoading = useSelector((state) => state.admin.users.isLoading);

  const onInputChange = useDebounceCb(setSearchString, modulesManager.getConf("fe-admin", "debounceTime", 400));
  // eslint-disable-next-line no-shadow
  const handleChange = (__, value) => {
    onChange(value);
    if (!multiple) setOpen(false);
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
      renderLastNameFirst ? p.iUser?.lastName : p.iUser?.otherNames,
      !renderLastNameFirst ? p.iUser?.lastName : p.iUser?.otherNames,
    ]
      .filter(Boolean)
      .join(" ");
  };

  useEffect(() => {
    if (searchString?.length > minCharLookup) {
      dispatch(
        fetchUsers(
          modulesManager,
          [searchString && `str: "${searchString}"`, ...(filters ?? [])].filter(Boolean),
          !healthFacility,
        ),
      );
    }
  }, [searchString]);

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers(modulesManager, [`first: 10`, ...(filters ?? [])], !healthFacility));
    }
  }, [open]);

  return (
    <Autocomplete
      loadingText={formatMessage("loadingText")}
      openText={formatMessage("openText")}
      closeText={formatMessage("closeText")}
      clearText={formatMessage("clearText")}
      openOnFocus
      multiple={multiple}
      disabled={readOnly}
      options={users}
      loading={isLoading}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      autoComplete
      value={value}
      getOptionLabel={(option) => formatSuggestion(option)}
      getOptionSelected={(option, v) => option.id === v.id}
      onChange={handleChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(__, query) => onInputChange(query)}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          variant="standard"
          required={required}
          label={withLabel && (label || formatMessage("label"))}
          placeholder={placeholder}
        />
      )}
    />
  );
};

export default withModulesManager(withTheme(withStyles(styles)(UserPicker)));
