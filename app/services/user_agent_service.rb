class UserAgentService
  def self.call
    new.any
  end

  def any
    FakeAgentInternal.instance.get
  end

  private

  class FakeAgentInternal
    include Singleton

    def get
      @agents ||= YAML.load_file('./user-agents.yml')['user_agents']
      @agents.sample
    end
  end
end
