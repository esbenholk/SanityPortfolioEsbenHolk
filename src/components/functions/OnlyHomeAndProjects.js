import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

// For skins that only have a home page and project pages: every other address goes home
export default function OnlyHomeAndProjects({ home, project }) {
  return (
    <Switch>
      <Route exact path="/">
        {home}
      </Route>
      <Route path="/projects/:slug">{project}</Route>
      <Redirect to="/" />
    </Switch>
  );
}
