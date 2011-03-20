# Formtastic Location Selector

## Installation

First, you'll need to install [Formtastic]

Next, install Maptastic as a plugin:

    script/plugin install git://github.com/pake007/maptastic.git (for Rails 2)
    rails plugin install git://github.com/pake007/maptastic.git (for Rails 3)


...and run the rake task to install the required js and css files into your javascripts and stylesheets directory. 

    rake maptastic:install

Then, you will probably need to include them in your layouts. And don't forget to include jquery lib which is used to code maptastic.js

    javascript_include_tag "jquery"

    javascript_include_tag "maptastic.js"
    stylesheet_link_tag "maptastic.css"
    
Also, you'll need to add the [Google Maps **V3**][3] script include in your page, above your semantic_form:

    javascript_include_tag "http://maps.google.com/maps/api/js?sensor=true"

Note that you no longer need an API key with the latest Google Maps release.

## Usage

Maptastic adds a new #multi_input method as well as the map control:

    <% semantic_form_for @venue do |f| %>
      <%= f.multi_input :latitude, :longitude, :as => :map, :zoom => 10 %>
    <% end %>

Note that the map input expects two parameters - a latitude and longitude, so you need to add these two fields in your model. The order is important. The option zoom is optional, which defines the size of initial map, you can use a number,  or a symbol which can be one of [:world, :country, :state, :province, :city, :district] or the corresponding string. So it can also be:

    <% semantic_form_for @venue do |f| %>
      <%= f.multi_input :latitude, :longitude, :as => :map, :zoom => "country" %>
    <% end %>

This plugin provides simple geocoding feature. If your want to zoom the map according to the address fields in the form, you need to do like:

    <% semantic_form_for @venue do |f| %>
      <%= f.input :country, :geocoder => true %>
      <%= f.input :city, :geocoder => true %>
      <%= f.input :address, :geocoder => true %>
    <% end %>

The address string will be the combination of the fields value, like "China, Shanghai, People Square". After inputing text or select option on the fields,  it will set your map center to the address you queried.

## Development

Maybe there will be more functions to added in. Or you can fork and enhance it by yourself, good luck!

## Thanks

MattHall:  Fork this plugin from his maptastic plugin. 
Arron Qian: Refactor the js file by using jquery metadata plugin.