import React, { Component } from "react";
import { Input, Button, Modal, notification } from "antd";
import DynamicInput from "../components/DynamicInput.js";
import DraggableInputs from "../components/DraggableInputs.js";
import NewDynamicHeaders from "../components/NewDynamicHeaders.js";
import Checklist from "../components/Checklist.js";
import DropdownSelection from "../components/DropdownSelection.js";
import TimeDropdowns from "../components/TimeDropdowns.js";
import roleHierarchy from "../roles/roleHierarchy.js";

/* PROPS
    checklistData: obj; has all the relevant fields for checklists (managed by parent component)
    updateField: function; updates the relevant field in the parent's state
    userInfo: obj; the logged-in user's info (used to determine which roles to display)
*/

const testFields = [
  {
    field: "shortDescription",
    prompt: "Short Description:"
  },
  {
    field: "longDescription",
    prompt: "Detailed Description:"
  }
];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const locations = ["Charlottesville, VA", "Newark, DE"];

export default class ChecklistForm extends Component {
  render() {
    // grab the relevant roles based on user's position in the hierarchy
    const roles = roleHierarchy[this.props.userInfo.role];
    return (
      <div>
        <h1> Title </h1>
        <Input
          style={{ width: 200 }}
          value={this.props.checklistData.title}
          onChange={e => this.props.updateField("title", e.target.value)}
          maxLength={50}
          placeholder={"Title (max 50 characters)"}
        />
        <div style={{ margin: "30px" }} />

        <h1> Description </h1>
        <Input
          style={{ width: 300 }}
          value={this.props.checklistData.description}
          onChange={e => this.props.updateField("description", e.target.value)}
          maxLength={500}
          placeholder={"Description (max 500 characters)"}
          type="textarea"
          autosize
        />
        <div style={{ margin: "30px 0" }} />

        <h1> Subsections </h1>
        <NewDynamicHeaders
          fields={testFields}
          data={this.props.checklistData.subsections}
          updateParent={subsections =>
            this.props.updateField("subsections", subsections)}
        />
        <div style={{ margin: "30px 0" }} />

        <div style={{ margin: "10px 0" }} />
        <h1> Days to Repeat </h1>
        <Checklist
          checklistValues={daysOfWeek}
          checkedValues={this.props.checklistData.daysToRepeat}
          onCheck={checkedItems =>
            this.props.updateField("daysToRepeat", checkedItems)}
        />
        <div style={{ margin: "30px 0" }} />

        <h1> End Times </h1>
        <TimeDropdowns
          timeData={this.props.checklistData.endTimes}
          onChange={data => this.props.updateField("endTimes", data)}
        />
        <div style={{ margin: "30px 0" }} />

        <h1> Role </h1>
        <DropdownSelection
          promptText={"Select Role"}
          dropdownValues={roles}
          onClickField={value => this.props.updateField("role", value)}
          selectedValue={this.props.checklistData.role}
        />
        <div style={{ margin: "30px 0" }} />

        <h1> Location(s) </h1>
        <Checklist
          checklistValues={locations}
          checkedValues={this.props.checklistData.locations}
          onCheck={checkedItems =>
            this.props.updateField("locations", checkedItems)}
        />
        <div style={{ margin: "30px 0" }} />
      </div>
    );
  }
}
