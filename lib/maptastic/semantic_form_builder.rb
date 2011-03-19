module Maptastic
  class SemanticFormBuilder < Formtastic::SemanticFormBuilder
    
    ZOOMS = {:world => 1, :country => 3, :state => 5, :province => 5, :city => 7, :district => 10}

    def multi_input(*args)
      options = args.extract_options!

      if (options[:as] == :map)
        map_input(args, options)
      else
        args.inject('') {|html, arg| html << input(arg, options)}
      end
    end

    def input(method, options = {})
      if options[:geocoder] == true 
        if options[:input_html] && options[:input_html][:class]
          options[:input_html][:class] << " maptastic-geocoder"
        else
          options[:input_html] = (options[:input] || {}).merge(:class => "maptastic-geocoder")
        end
      end
      super
    end

  private

    def map_div_id(methods)
      generate_html_id(methods.map(&:to_s).join('_') << '_map')
    end

    def map_input_id(method)
      generate_html_id("map_#{method}")
    end

    def to_metadata_options(methods, options)
      zoom = (options[:zoom].class == Fixnum) ? options[:zoom] : (ZOOMS[(options[:zoom].class == String ? options[:zoom].intern : options[:zoom])] || 1)
      {
        :gmap => {
          :zoom => zoom,
          :latInput => '#' + map_input_id(methods.first),
          :lngInput => '#' + map_input_id(methods.last)
        }
      }.to_json
    end

    def container_options(methods, options)
      {
        :id => map_div_id(methods),
        :class => 'gmap',
        :'data-meta' => to_metadata_options(methods, options)
      }
    end

    def map_input(methods, options = {})
      options[:hint] ||= "Click to select a location, then drag the marker to position"
      inputs_html = methods.inject('') {|html, method| html << input(method, :id => map_input_id(method), :as => :hidden)}
      hint_html = inline_hints_for(methods.first, options)
      map_container = @template.content_tag(:div, nil, container_options(methods, options))
      map_html = @template.content_tag(:li, map_container)

      Formtastic::Util.html_safe(inputs_html + map_html)
    end

  end

end
