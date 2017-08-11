import React, { Component } from "react";
import { Collapse } from "antd";
import ViewSingleChecklist from "./ViewSingleChecklist.js";
import createEndTimeString from "../helperFunctions/createEndTimeString.js";
import sortEndTimes from "../helperFunctions/sortEndTimes.js";
import isChecklistCompleted from "../helperFunctions/isChecklistCompleted.js";
import isPastEndTime from "../helperFunctions/isPastEndTime.js";

/* PROPS:
    checklists: [obj], the checklist objects pulled from firebase to render
    firebasePath: string, the path where these checklists are coming from in
      the form "/dailyLists/<YYYY-MM-DD>/<location>/<role>"
*/

export default class ListOfChecklists extends Component {
  render() {
    // create an array of the checklists
    let checklistArray = Object.keys(this.props.checklists).map(key => {
      return this.props.checklists[key];
    });

    // sort them based on their end times
    checklistArray.sort(function(a, b) {
      return sortEndTimes(a.endTime, b.endTime);
    });

    // the CSS color constants
    const red = "red";
    const green = "green";
    const darkOrange = "#bf833b";

    // render each checklist as a Collapse from antd, where the inner panel
    // displays the checklist itself as a ViewSingleChecklist component.
    // the color of the text in the header is determined by whether or not
    // the checklist is completed and if it's late
    const renderedChecklists = checklistArray.map(checklist => {
      let headerWithEndTime =
        checklist.title + " (" + createEndTimeString(checklist.endTime) + ")";

      // determine the header color
      let headerStyle = { color: green };
      if (!isChecklistCompleted(checklist)) {
        if (isPastEndTime(checklist.endTime, "America/New_York")) {
          headerStyle.color = red;
        } else {
          headerStyle.color = darkOrange;
        }
      }

      headerWithEndTime = (
        <p style={headerStyle}>
          {" "}{headerWithEndTime}{" "}
        </p>
      );

      return (
        <Collapse.Panel header={headerWithEndTime}>
          <ViewSingleChecklist
            checklist={checklist}
            firebasePath={this.props.firebasePath}
          />
        </Collapse.Panel>
      );
    });

    return (
      <Collapse accordion>
        {renderedChecklists}
      </Collapse>
    );
  }
}
