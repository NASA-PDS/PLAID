/**
 * Created by morse on 7/27/16.
 */
var infoBarData = {
    builder: ("<div><b>Please create the groups and attributes necessary for capturing your Mission Specifics.</b></div><br>" +
              "<div>Use the included buttons to add or remove attributes and groups. Your changes will be visible in the Mission Specific Preview window.</div></br>"+
              "<div>Remember, groups are collections of metadata around a common theme while attributes are pieces of metadata with only one value.</div><br>" +
              "<div>When you have finished creating all of your groups and attributes, select 'Save' to complete your label template.</div><br/>"+
              "<div><em>Need Help?</em></div>" +
              "<div style='font-size: small;'>Take a look at this example <a href=ms_example.xml target=_blank>Mission Specifics section.</a></div><br>"),
    dashboard: ("<div><b>Welcome to the LDT Dashboard.</b></div><br/>"+
                "<div>If you would like to start a new label template, select <i>Create new</i>.</div><br/>"+
                "<div>You can also see all of your existing label templates in the dashboard. If you would like to continue your work on a template, select <i>Edit</i>. If you would like to remove a template, select <i>Delete</i>.</div></br>"+
                "<div style='font-size: small;'>Note: If you accidentally delete a label template, contact the LDT administrator to restore it from the database.</div>"),
    discipline_nodes: ("<div><b>Please select the discipline nodes that you would like to include in your product's label.</b></div><br>"+
                       "<div>The PDS has varying requirements for different subject matters and divides these into disciplines.</div><br>"+
                       "<div>To decide which ones you should add, hover over each discipline node to see its description. </div><br>"+
                       "<div>Helpful Tips:</div>"+
                       "<div style='font-size: small;'>&#8226; If your mission takes pictures, you need the Imaging node.</div>"+
                       "<div style='font-size: small;'>&#8226; If your mission has a spacecraft or a rover, you need the Geometry node.</div><br/>"+
                       "<div><em>Need Help?</em></div>" +
                       "<div style='font-size: small;'>Find your answers in <a href=resources/ldt_guide.pdf target=_blank>the full LDT guide.</a></div><br>"),
    export: ("<div><b>Your label template is complete!</b></div><br/>" +
             "<div>Before exporting your label, please review the preview to ensure your label template is accurate.</div><br/>"+
             "<div>After that, please enter a valid* filename for your label template and then click 'Export'.<br/>"+
             "The file will be available in your Downloads folder.</div><br/><br/>"+
             "<div style='font-size: small'>*Filename may have characters, digits, underscores, and hyphens. It must start with a character and end with an .xml extension.</div>"),
    mission_specifics: ("<div><b>Do you need to include more information in your label?</b></div><br>"+
                        "<div>If so, please select 'Yes' to start adding to the Mission Specifics section. This will take you into the builder interface where you will be able to add groups and attributes.</div><br>"+
                        "<div>If not, please select 'No' to skip this step and complete your label template.</div><br>"+
                        "<div><em>Need Help?</em></div>" +
                        "<div style='font-size: small;'>Find your answers in <a href=resources/ldt_guide.pdf target=_blank> the full LDT guide.</a></div><br>"),
    optional_nodes: ("<div><b>Please choose the applicable elements for your product.</b></div><br/>" +
                     "<div>Feel free to add or remove elements as you like. The quantity of each element is bounded by the PDS4 Standard so you won't create an invalid label template.</div><br/>" +
                     "<div>Hover over any of the elements to view helpful descriptions to guide your decisions. These descriptions include whether the element is required or optional, how many times it can occur, and what it is.<br/><br/>" +
                     "If the element has sub-elements, these will also be listed in the description. These sub-elements may be required or optional depending on if you include the parent element.</div><br/>"+
                     "<div><em>Need Help?</em></div>" +
                     "<div style='font-size: small;'>Find your answers in <a href=resources/ldt_guide.pdf target=_blank> the full LDT guide.</a></div><br>"),
    product_type: ("<div><b>Please select your product type to get started.</b></div><br>" +
                   "<div>The product type defines the general structure for your label based on the Planetary Data System’s most recent archiving standards.</div><br>" +
                   "<div>If you are wondering which product type to choose, hover over the buttons for descriptions. Most users create labels for the Observational product type.</div><br/>" +
                   "<div>Helpful tips:</div>"+
                   "<div style='font-size: small'>&#8226; Have a list of the items you want in your label!</div>" +
                   "<div style='font-size: small;'>&#8226; Check out a <a href=https://starbase.jpl.nasa.gov/pds4/1600/dph_example_products/product_array_2d_image/Product_Array_2D_Image.xml target=_blank>sample label</a> from another mission!</div><br/>" +
                   "<div><em>Need Help?</em></div>" +
                   "<div style='font-size: small;'>Find your answers in the full<a href=resources/ldt_guide.pdf target=_blank> LDT guide.</a></div><br>")
};