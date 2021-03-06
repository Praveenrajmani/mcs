// This file is part of MinIO Console Server
// Copyright (c) 2019 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useEffect, useState } from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ModalWrapper from "../../Common/ModalWrapper/ModalWrapper";
import api from "../../../../common/api";
import { serverNeedsRestart } from "../../../../actions";
import { connect } from "react-redux";
import ConfTargetGeneric from "../ConfTargetGeneric";
import { fieldsConfigurations, removeEmptyFields } from "../utils";
import { IConfigurationElement, IElementValue } from "../types";

const styles = (theme: Theme) =>
  createStyles({
    errorBlock: {
      color: "red"
    },
    strongText: {
      fontWeight: 700
    },
    keyName: {
      marginLeft: 5
    },
    buttonContainer: {
      textAlign: "right"
    },
    logoButton: {
      height: "80px"
    }
  });

interface IAddNotificationEndpointProps {
  open: boolean;
  closeModalAndRefresh: any;
  serverNeedsRestart: typeof serverNeedsRestart;
  selectedConfiguration: IConfigurationElement;
  classes: any;
}

const EditConfiguration = ({
  open,
  closeModalAndRefresh,
  serverNeedsRestart,
  selectedConfiguration,
  classes
}: IAddNotificationEndpointProps) => {
  //Local States
  const [valuesObj, setValueObj] = useState<IElementValue[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [addError, setError] = useState<string>("");

  //Effects

  useEffect(() => {
    if (saving) {
      const payload = {
        key_values: removeEmptyFields(valuesObj)
      };
      api
        .invoke(
          "PUT",
          `/api/v1/configs/${selectedConfiguration.configuration_id}`,
          payload
        )
        .then(res => {
          setSaving(false);
          setError("");
          serverNeedsRestart(true);

          closeModalAndRefresh();
        })
        .catch(err => {
          setSaving(false);
          setError(err);
        });
    }
  }, [
    saving,
    serverNeedsRestart,
    selectedConfiguration,
    valuesObj,
    closeModalAndRefresh
  ]);

  //Fetch Actions
  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
  };

  const onValueChange = useCallback(
    newValue => {
      setValueObj(newValue);
    },
    [setValueObj]
  );

  return (
    <ModalWrapper
      modalOpen={open}
      onClose={closeModalAndRefresh}
      title={selectedConfiguration.configuration_label}
    >
      <React.Fragment>
        {addError !== "" && (
          <Grid item xs={12}>
            <Typography
              component="p"
              variant="body1"
              className={classes.errorBlock}
            >
              {addError}
            </Typography>
          </Grid>
        )}
        <form noValidate onSubmit={submitForm}>
          <ConfTargetGeneric
            fields={
              fieldsConfigurations[selectedConfiguration.configuration_id]
            }
            onChange={onValueChange}
          />
          <Grid item xs={3} className={classes.buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={saving}
            >
              Save
            </Button>
          </Grid>
          <Grid item xs={9} />
        </form>
      </React.Fragment>
    </ModalWrapper>
  );
};

const connector = connect(null, { serverNeedsRestart });

export default connector(withStyles(styles)(EditConfiguration));
