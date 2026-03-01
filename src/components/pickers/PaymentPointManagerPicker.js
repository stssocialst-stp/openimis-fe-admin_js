import React, { useState } from "react";

import { TextField } from "@material-ui/core";

import { useGraphqlQuery, useTranslations, Autocomplete } from "@stssocialst-stp/fe-core";
import { USER_PICKER_PROJECTION } from "../../actions";

function PaymentPointManagerPicker({
  readOnly,
  value,
  onChange,
  required,
  withLabel,
  withPlaceholder,
  filterOptions,
  filterSelectedOptions,
}) {
  const [searchString, setSearchString] = useState();
  const { formatMessage } = useTranslations("admin");

  // Note: IMIS Administrator covers all Payment Point Manager permissions
  const paymentPointManagerRoleId = 7;

  const formatSuggestion = (ppm) =>
    [ppm?.username, ppm?.iUser?.lastName, ppm?.iUser?.otherNames].filter(Boolean).join(" ");

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query paymentPointManager($searchString: String, $roleId: Int) {
        users(str: $searchString, roleId: $roleId) {
          edges {
            node {
              ${USER_PICKER_PROJECTION.join(" ")}
            }
          }
        }
      }
    `,
    {
      str: searchString,
      roleId: paymentPointManagerRoleId,
    },
  );

  const paymentPointManagers = data?.users?.edges.map((edge) => edge.node) ?? [];

  return (
    <Autocomplete
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      value={value}
      placeholder={formatMessage("PaymentPointManagerPicker.placeholder")}
      label={formatMessage("PaymentPointManagerPicker.label")}
      isLoading={isLoading}
      options={paymentPointManagers}
      error={error}
      getOptionLabel={(option) => formatSuggestion(option)}
      onChange={(user) => onChange(user)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={() => setSearchString(searchString)}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          variant="standard"
          required={required}
          label={withLabel && formatMessage("PaymentPointManagerPicker.label")}
          placeholder={withPlaceholder && formatMessage("PaymentPointManagerPicker.placeholder")}
        />
      )}
    />
  );
}

export default PaymentPointManagerPicker;
