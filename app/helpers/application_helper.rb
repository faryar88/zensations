module ApplicationHelper
  def nav_menu_right

    if @current_user.present?
      links = "<li>#{ link_to('Sign Out ' + @current_user.name, login_path, :method => :delete) }</li>"
    else
      links = "<li>#{ link_to('Sign Up', "#", :class => "signup") }</li><li>#{ link_to('Log In', "#", :class => "login") }</li>"
    end

    links
  end 
end