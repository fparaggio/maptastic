(function($){
  var GMap = function(el, options) {
    if($(el).data('gmap-instance'))
      return;

    var $latInput = $(options.latInput);
		var $lngInput = $(options.lngInput);
		var lat = $latInput.val();
		var lng = $lngInput.val();
		var self = this;

    options.zoom = parseInt(options.zoom);
		this.options = options;
		this.el = el;

		var map = new google.maps.Map(el, {
			zoom: options.zoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		this.map = map;

		if ( lat && lng ) {
			var location = new google.maps.LatLng(lat, lng);
			map.setCenter(location);
			this.setMarker(location);
		} else if (navigator.geolocation) {$(this).find("select")
  		navigator.geolocation.getCurrentPosition(function(position) {
    	  initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    		map.setCenter(initialLocation);
  		});
		}

		google.maps.event.addListener(map, 'click', function(event){
			self.setMarker(event.latLng);
			self.updateInputs(event.latLng);
		});
		$(el).data('gmap-instance', this);
  }

  GMap.prototype = {
    setMarker : function(location) {

  		if (!this.marker){
  		  this.createMarker(location);
		  }

  		this.marker.setPosition(location);
  	},

  	createMarker : function(location) {
  	  var self = this;

  		this.marker = new google.maps.Marker({
  			map: self.map,
  			title: 'Drag to reposition',
  			draggable: true
  		});

  		google.maps.event.addListener(this.marker, 'dragend', function(event) {
  			self.updateInputs(event.latLng);
  		});
  	},

  	updateInputs : function(location) {
  		$(this.options.latInput).val(location.lat());
  		$(this.options.lngInput).val(location.lng());
  	},

  	findAddress : function(address) {
  	  var self = this;

  	  if (!this.geocoder) {
  	    this.geocoder = new google.maps.Geocoder();
  	  }

      this.geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && self.map) {
          var location = results[0].geometry.location
          self.map.setCenter(location);
          self.setMarker(location);
          self.updateInputs(location);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
  	},

  	destroy : function() {
  	  $(this.el).data('gmap-instance', null);
  	  $(this.el).html("");
  	}
  };

  GMap.defaultOptions = {
    zoom     : 8,
    latInput : null,
    lngInput : null
  };

  $.fn.gmap = function(options) {
    this.each(function(){
      if(typeof options != "string") {
        var o = $(this).metadata()['gmap'];
        new GMap(this, $.extend({}, GMap.defaultOptions, options, o));
      } else {
        var fnName = options;
        var gmap = $(this).data("gmap-instance");
        if(gmap) {
          gmap[fnName].apply(gmap, Array.prototype.slice.call(arguments, 1));
        }
      }
    });
  };

  // jquery.metadata plugin
  $.extend({
    metadata : {
      defaults : {
        type: 'class',
        name: 'metadata',
        cre: /({.*})/,
        single: 'metadata'
      },
      setType: function( type, name ){
        this.defaults.type = type;
        this.defaults.name = name;
      },
      get: function( elem, opts ){
        var settings = $.extend({},this.defaults,opts);
        // check for empty string in single property
        if ( !settings.single.length ) settings.single = 'metadata';

        var data = $.data(elem, settings.single);
        // returned cached data if it already exists
        if ( data ) return data;

        data = "{}";

        var getObject = function(data) {
          if(typeof data != "string") return data;

          data = eval("(" + data + ")");
          return data;
        }

        if ( settings.type == "html5" ) {
          var object = {};
          $( elem.attributes ).each(function() {
            var name = this.nodeName;
            if(name.match(/^data-/)) name = name.replace(/^data-/, '');
            else return true;
            object[name] = getObject(this.nodeValue);
          });
        } else {
          if ( settings.type == "class" ) {
            var m = settings.cre.exec( elem.className );
            if ( m )
              data = m[1];
          } else if ( settings.type == "elem" ) {
            if( !elem.getElementsByTagName ) return;
            var e = elem.getElementsByTagName(settings.name);
            if ( e.length )
              data = $.trim(e[0].innerHTML);
          } else if ( elem.getAttribute != undefined ) {
            var attr = elem.getAttribute( settings.name );
            if ( attr )
              data = attr;
          }
          object = getObject(data.indexOf("{") < 0 ? "{" + data + "}" : data);
        }

        $.data( elem, settings.single, object );
        return object;
      }
    }
  });

  $.fn.metadata = function( opts ){
    return $.metadata.get( this[0], opts );
  };

})(jQuery);


$.metadata.setType("attr", "data-meta");

$(function(){
  // render google map if needed
  if($.fn.gmap) {
    $(".gmap").gmap();
  }

  // define the event handler for maptastic-geocoder fields
  geocoder = new google.maps.Geocoder();

  var relocate = function(el) {
    var address = "";
    var parent = $(el).closest('form');
    var gmap = parent.find('.gmap').data('gmap-instance');
    
    $(".maptastic-geocoder").each(function(){
      if($(this).is("select")) {
        address += $(this).find("option[selected]='selected'").text() + ' ';
      } else if($(this).is("input")) {
        address += $(this).val() + ' ';
      }
    });

    if(address.replace(/\s/g, "") == "") return false;
    gmap.findAddress(address);
  }

  $(".maptastic-geocoder").each(function(){
    if($(this).is("select")) {
      $(this).bind("change", function(){
        relocate(this);
      });
    } else if($(this).is("input")) {
      $(this).bind({
        "blur" : function() {
          relocate(this);
        },
        "keydown" : function(event) {
          if(event.keyCode == 13) {
            relocate(this);
            return false;
          }
        }
      });    
    }
  });
});
