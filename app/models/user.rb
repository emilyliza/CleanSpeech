class User < ActiveRecord::Base
	has_many :words, :through => :users_words
	has_many :users_words
	has_many :speech_attempts
end
