class UsersController < ApplicationController
  layout 'login_signup'
  
  def new
    @user = User.new
  end

  # Depracated after AJAX Login working

  # def create 
  #   @user = User.new user_params
  #   if @user.save
  #     session[:user_id] = @user.id
  #     redirect_to root_path
  #   else
  #     render :new
  #   end 
  # end 

  def create
    @user = User.new user_params
    if @user.save
      session[:user_id] = @user.id
      render json: { status: "OK" }
    else
      render json: @user.errors.messages
    end
  end


  def index
    @users = User.all
  end

  def edit 
    @user = User.find params[:id]
    
    unless @user == @current_user
      redirect_to root_path
    end
  end

  def show
    @user = User.find params[:id]
  end

  def update
    @user = User.find params[:id]
    @user.update user_params
    redirect_to @user
  end

  def signup_login
    session[:destination] ||= request.env["HTTP_REFERER"]
  end

  private
  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

end