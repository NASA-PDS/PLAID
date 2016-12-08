/**
 * Copyright 2017 California Institute of Technology, developed with support from NASA.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @file Contains the calls to initialize the LDT wizard and control its height.
 *
 * Creation Date: 6/17/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
$(document).ready(function(){
    matchWizardHeight($("#wizard .content.clearfix")[0], $("#wizard .actions.clearfix")[0],
        $(".infoBar")[0], $("div.steps")[0]);
});
$(window).resize(function(){
    matchWizardHeight($("#wizard .content.clearfix")[0], $("#wizard .actions.clearfix")[0],
        $(".infoBar")[0], $("div.steps")[0]);
});
initWizard($("#wizard"));